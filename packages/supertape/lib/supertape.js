'use strict';

const {EventEmitter} = require('events');
const once = require('once');

const options = require('../supertape.json');

const runTests = require('./run-tests');
const reporter = require('./reporter');

const createReporter = once(reporter.createReporter);
const createEmitter = once(_createEmitter);

const {assign} = Object;
const {stdout} = process;

const getOperators = once(async () => {
    const {operators} = options;
    const {loadOperators} = await import('@supertape/engine-loader');
    
    return await loadOperators(operators);
});

const defaultOptions = {
    skip: false,
    only: false,
    extensions: {},
    quiet: false,
    format: 'tap',
    run: true,
    getOperators,
};

function _createEmitter({quiet, format, getOperators}) {
    const tests = [];
    const emitter = new EventEmitter();
    const {harness, reporter} = createReporter(format);
    
    if (!quiet)
        harness.pipe(stdout);
    
    emitter.on('test', (message, fn, {skip, only, extensions}) => {
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
    
    emitter.on('run', async () => {
        const operators = await getOperators();
        
        const {failed} = await run(tests, {
            reporter,
            operators,
        });
        
        emitter.emit('end', {failed});
    });
    
    return emitter;
}

module.exports = test;

const initedOptions = {
    format: 'tap',
};

module.exports.init = (options) => {
    assign(initedOptions, options);
};

const createStream = () => {
    const {format} = initedOptions;
    const {harness} = createReporter(format);
    
    return harness;
};

module.exports.createStream = createStream;

function test(message, fn, options = {}) {
    const {
        run,
        quiet,
        format,
        only,
        skip,
        extensions,
        getOperators,
    } = {
        ...defaultOptions,
        ...options,
        ...initedOptions,
    };
    
    const emitter = createEmitter({
        format,
        quiet,
        getOperators,
    });
    
    emitter.emit('test', message, fn, {
        skip,
        only,
        extensions,
    });
    
    if (run)
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

const getExtend = (extensions, type) => (message, fn, options) => {
    return test(message, fn, {
        extensions,
        ...options,
        ...type,
    });
};

test.stub = require('@cloudcmd/stub');

test.extend = (extensions) => {
    const extendedTest = getExtend(extensions);
    
    extendedTest.only = getExtend(extensions, {
        only: true,
    });
    
    extendedTest.skip = getExtend(extensions, {
        skip: true,
    });
    
    return extendedTest;
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

module.exports.run = () => {
    const emitter = createEmitter();
    emitter.emit('loop');
    return emitter;
};

async function run(tests, {reporter, operators}) {
    const onlyTests = tests.filter(isOnly);
    
    if (onlyTests.length)
        return await runTests(onlyTests, {
            reporter,
            operators,
        });
    
    const notSkipedTests = tests.filter(notSkip);
    
    return await runTests(notSkipedTests, {
        reporter,
        operators,
    });
}

