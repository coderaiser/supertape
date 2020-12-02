'use strict';

const {EventEmitter} = require('events');
const once = require('once');

const runTests = require('./run-tests');

const {assign} = Object;

const createOutput = ({emit, output = []}) => {
    return (...args) => {
        const [line] = args;
        
        if (!args.length)
            return output.join('');
        
        emit('line', `${line}\n`);
        output.push(line);
    }
};

const createEmitter = once(({stream}) => {
    const tests = [];
    const output = [];
    
    const emitter = new EventEmitter();
    const emit = emitter.emit.bind(emitter);
    const out = createOutput({emit, output});
    
    emitter.on('test', (message, fn, {skip, only}) => {
        tests.push({
            message,
            fn,
            skip,
            only,
        });
    });
    
    emitter.on('loop', () => {
        loop({
            emitter,
            tests,
        });
    });
    
    emitter.on('line', (line) => {
        stream.write(line);
    });
    
    emitter.on('run', async () => {
        await run(tests, {
            out,
        });
        
        emitter.emit('result', out());
        emitter.emit('end');
    });
    
    return emitter;
});

module.exports = test;

function test(message, fn, options = {}) {
    const {
        stream = process.stdout,
        only = false,
        skip = false,
    } = options;
    
    const emitter = createEmitter({
        stream,
    });
    
    emitter.emit('test', message, fn, {skip, only});
    emitter.emit('loop');
    
    return emitter;
};

module.exports.skip = (message, fn) => {
    test(message, fn, {
        skip: true
    });
};

module.exports.only = (message, fn) => {
    test(message, fn, {
        only: true
    });
};

const isOnly = ({only}) => only;
const notSkip = ({skip}) => !skip;

const loop = once(({emitter, tests}) => {
    let runned = false;
    let previousCount = 0;
    
    (function loop() {
        if (previousCount === tests.length) {
            runned = true;
            emitter.emit('run');
            return;
        }
        
        previousCount = tests.length;
        
        // 5ms ought to be enough for anybody
        setTimeout(loop, 5);
    })();
});

async function run(tests, {out}) {
    const onlyTests = tests.filter(isOnly);
    
    if (onlyTests.length)
        return await runTests(onlyTests, {out});
    
    const notSkipedTests = tests.filter(notSkip)
    
    await runTests(notSkipedTests, {out});
}

