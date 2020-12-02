'use strict';

const {EventEmitter} = require('events');
const once = require('once');

const runTests = require('./run-tests');
const {TapeReader} = require('./stream');

const createEmitter = once(_createEmitter);

const streamStub = {
    write: () => {},
};

const createOutput = ({emit, output = []}) => {
    return (...args) => {
        const [line] = args;
        
        if (!args.length)
            return output.join('\n');
        
        emit('line', `${line}\n`);
        output.push(line);
    }
};

const defaultOptions = {
    skip: false,
    only: false,
};

function _createEmitter({stream}) {
    const tests = [];
    const output = [];
    
    const emitter = new EventEmitter();
    const emit = emitter.emit.bind(emitter);
    const out = createOutput({emit, output});
    
    emitter.on('test', (message, fn, {skip, only} = defaultOptions) => {
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
}

module.exports = test;

module.exports.createEmitter = () => {
    const stream = streamStub;
    
    return _createEmitter({
        stream
    });
};

module.exports.createStream = (emitter) => {
    return new TapeReader({
        emitter,
    })
};

function test(message, fn, options = {}) {
    const {
        stream = process.stdout,
        only = false,
        skip = false,
        quiet = false,
    } = options;
    
    const emitter = createEmitter({
        stream: quiet ? streamStub : stream,
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

module.exports.runTests = runTests;
module.exports.createOutput = createOutput;

async function run(tests, {out}) {
    const onlyTests = tests.filter(isOnly);
    
    if (onlyTests.length)
        return await runTests(onlyTests, {out});
    
    const notSkipedTests = tests.filter(notSkip)
    
    await runTests(notSkipedTests, {out});
}

