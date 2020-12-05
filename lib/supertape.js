'use strict';

const {EventEmitter} = require('events');
const once = require('once');

const runTests = require('./run-tests');
const {TapeReader} = require('./stream');

const createEmitter = once(_createEmitter);

const {assign} = Object;

const noop = () => {};
const streamStub = {
    write: () => {},
};

const defaultOptions = {
    skip: false,
    only: false,
    extensions: {},
};

const createOutput = ({emit = noop, output = []} = {}) => {
    return (...args) => {
        const [line] = args;
        
        if (!args.length)
            return output.join('\n');
        
        emit('line', `${line}\n`);
        output.push(line);
    };
};

function _createEmitter({stream}) {
    const tests = [];
    const output = [];
    
    const emitter = new EventEmitter();
    const emit = emitter.emit.bind(emitter);
    const out = createOutput({emit, output});
    
    emitter.on('test', (message, fn, {skip, only, extensions} = defaultOptions) => {
        tests.push({
            message,
            fn,
            skip,
            only,
            extensions,
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

const initedOptions = {};

module.exports.init = (options) => {
    assign(initedOptions, options);
};

module.exports.createEmitter = () => {
    const stream = streamStub;
    
    return _createEmitter({
        stream,
    });
};

module.exports.createStream = (emitter) => {
    return new TapeReader({
        emitter,
    });
};

function test(message, fn, options = {}) {
    const {
        stream = process.stdout,
        quiet = false,
        loop = true,
        only,
        skip,
        extensions,
    } = {
        ...defaultOptions,
        ...options,
        ...initedOptions,
    };
    
    const emitter = createEmitter({
        stream: quiet ? streamStub : stream,
    });
    
    emitter.emit('test', message, fn, {
        skip,
        only,
        extensions,
    });
    
    if (loop)
        emitter.emit('loop');
    
    return emitter;
}

test.skip = (message, fn, options) => {
    return test(message, fn, {
        ...options,
        skip: true,
    });
};

test.only = (message, fn, options) => {
    return test(message, fn, {
        ...options,
        only: true,
    });
};

const getExtend = (...type) => (extensions) => (message, fn, options) => {
    return test(message, fn, {
        extensions,
        ...options,
        ...type,
    });
};

test.extend = getExtend();
test.extend.only = getExtend({only: true});
test.extend.skip = getExtend({skip: true});

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

module.exports.loop = () => {
    createEmitter().emit('loop');
};

module.exports.runTests = runTests;
module.exports.createOutput = createOutput;

async function run(tests, {out}) {
    const onlyTests = tests.filter(isOnly);
    
    if (onlyTests.length)
        return await runTests(onlyTests, {out});
    
    const notSkipedTests = tests.filter(notSkip);
    
    if (!notSkipedTests.length)
        return;
    
    await runTests(notSkipedTests, {out});
}

