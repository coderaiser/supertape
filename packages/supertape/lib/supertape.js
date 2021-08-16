'use strict';

const {EventEmitter} = require('events');
const once = require('once');
const {createSimport} = require('simport');
const StackTracey = require('stacktracey');

const options = require('../supertape.json');

const runTests = require('./run-tests');
const createFormatter = once(require('./formatter').createFormatter);

const createEmitter = once(_createEmitter);
const simport = createSimport(__filename);

const {assign} = Object;
const {stdout} = process;

let mainEmitter;

const getOperators = once(async () => {
    const {operators} = options;
    const {loadOperators} = await simport('@supertape/engine-loader');
    
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
    isStop: () => false,
    checkDuplicates: false,
};

function _createEmitter({quiet, format, getOperators, isStop, checkDuplicates}) {
    const tests = [];
    const emitter = new EventEmitter();
    
    emitter.on('test', (message, fn, {skip, only, extensions, duplicatesMessage}) => {
        tests.push({
            message,
            fn,
            skip,
            only,
            extensions,
            duplicatesMessage,
        });
    });
    
    emitter.on('loop', () => {
        loop({
            emitter,
            tests,
        });
    });
    
    emitter.on('run', async () => {
        const {harness, formatter} = createFormatter(format);
        
        if (!quiet)
            harness.pipe(stdout);
        
        const operators = await getOperators();
        const {failed} = await runTests(tests, {
            formatter,
            operators,
            isStop,
            checkDuplicates,
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
    const {harness} = createFormatter(format);
    
    return harness;
};

module.exports.createStream = createStream;

// update when refactore
const messages = new Set();
const INDEX_OF_FILE = 2;
const getDuplicatesMessage = ({message, checkDuplicates}) => {
    if (!checkDuplicates)
        return '';
    
    if (!messages.has(message)) {
        messages.add(message);
        return '';
    }
    
    const {items} = new StackTracey(Error());
    const {beforeParse} = items[INDEX_OF_FILE];
    
    return `Duplicate message ${beforeParse}`;
};

function test(message, fn, options = {}) {
    const {
        run,
        quiet,
        format,
        only,
        skip,
        extensions,
        getOperators,
        isStop,
        checkDuplicates,
    } = {
        ...defaultOptions,
        ...options,
        ...initedOptions,
    };
    
    const duplicatesMessage = getDuplicatesMessage({
        message,
        checkDuplicates,
    });
    
    const emitter = createEmitter({
        format,
        quiet,
        getOperators,
        isStop,
        checkDuplicates,
    });
    
    mainEmitter = emitter;
    
    emitter.emit('test', message, fn, {
        skip,
        only,
        extensions,
        duplicatesMessage,
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
test.test = test;

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
    if (!mainEmitter) {
        return fakeEmitter();
    }
    
    mainEmitter.emit('loop');
    
    return mainEmitter;
};

function fakeEmitter() {
    const emitter = new EventEmitter();
    
    process.nextTick(() => {
        emitter.emit('end', {
            failed: 0,
        });
    });
    
    return emitter;
}

