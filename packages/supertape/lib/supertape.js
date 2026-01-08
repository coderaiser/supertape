'use strict';

const process = require('node:process');
const {PassThrough} = require('node:stream');

const stub = require('@cloudcmd/stub');

const once = require('once');
const {maybeOnce} = require('./maybe-once');

const options = require('../supertape.json');

const {getAt, setValidations} = require('./validator');
const _createFormatter = require('./formatter').createFormatter;

const {createEmitter: _createEmitter} = require('./emitter.mjs');

const createFormatter = once(_createFormatter);
const createEmitter = once(_createEmitter);

const {assign} = Object;

// 5ms ought to be enough for anybody
const {
    SUPERTAPE_LOAD_LOOP_TIMEOUT = 5,
    SUPERTAPE_TIMEOUT = 3000,
} = process.env;

let mainEmitter;

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
    isStop: () => false,
    checkDuplicates: true,
    checkIfEnded: true,
    checkAssertionsCount: true,
    checkScopes: true,
    timeout: SUPERTAPE_TIMEOUT,
};

module.exports = test;

const initedOptions = {
    format: 'tap',
};

module.exports.init = (options) => {
    assign(initedOptions, options);
};

const createStream = async () => {
    const {format} = initedOptions;
    const {harness} = await createFormatter(format);
    
    return harness;
};

module.exports.createStream = createStream;
module.exports.createTest = async (testOptions = {}) => {
    const {
        format = 'tap',
        formatter,
        isDebug,
    } = testOptions;
    
    const readyFormatter = await _createFormatter(formatter || format);
    
    const stream = new PassThrough();
    const emitter = _createEmitter({
        ...defaultOptions,
        ...testOptions,
        readyFormatter,
        stream,
        loop,
        createFormatter,
        isDebug,
    });
    
    const fn = (message, fn, options = {}) => {
        return test(message, fn, {
            ...testOptions,
            ...options,
            emitter,
        });
    };
    
    assign(fn, {
        stream,
        ...test,
        test: fn,
        run: () => {
            emitter.emit('run');
        },
    });
    
    return fn;
};

function test(message, fn, options = {}, overrides = {}) {
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
        checkScopes,
        checkAssertionsCount,
        checkIfEnded,
        workerFormatter,
        timeout,
    } = {
        ...defaultOptions,
        ...initedOptions,
        ...options,
    };
    
    const {StackTracey} = overrides;
    
    const validations = {
        checkDuplicates,
        checkScopes,
        checkAssertionsCount,
        checkIfEnded,
    };
    
    setValidations(validations);
    
    const at = getAt({
        StackTracey,
    });
    
    const emitter = options.emitter || createEmitter({
        loop,
        format,
        quiet,
        getOperators,
        isStop,
        workerFormatter,
        createFormatter,
    });
    
    mainEmitter = emitter;
    
    emitter.emit('test', message, fn, {
        skip,
        only,
        extensions,
        at,
        validations,
        timeout,
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

test.stub = stub;
test.test = test;

test.extend = (extensions) => {
    const extendedTest = getExtend(extensions);
    
    assign(extendedTest, {
        test: extendedTest,
        stub,
    });
    
    extendedTest.only = getExtend(extensions, {
        only: true,
    });
    
    extendedTest.skip = getExtend(extensions, {
        skip: true,
    });
    
    return extendedTest;
};

const loop = maybeOnce(({emitter, tests}) => {
    let previousCount = 0;
    
    (function loop() {
        if (previousCount === tests.length) {
            emitter.emit('run');
            
            return;
        }
        
        previousCount = tests.length;
        setTimeout(loop, SUPERTAPE_LOAD_LOOP_TIMEOUT);
    })();
});

module.exports.run = () => {
    mainEmitter.emit('loop');
    return mainEmitter;
};
