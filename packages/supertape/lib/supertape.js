'use strict';

const process = require('node:process');
const {EventEmitter} = require('node:events');
const {PassThrough} = require('node:stream');

const stub = require('@cloudcmd/stub');

const once = require('once');
const {maybeOnce} = require('./maybe-once');

const options = require('../supertape.json');

const {getAt, setValidations} = require('./validator');
const runTests = require('./run-tests');
const _createFormatter = require('./formatter').createFormatter;
const createFormatter = once(_createFormatter);

const createEmitter = once(_createEmitter);

const {assign} = Object;
const {stdout} = process;

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

function _createEmitter(overrides = {}) {
    const {
        quiet,
        stream = stdout,
        format,
        getOperators,
        isStop,
        readyFormatter,
        workerFormatter,
    } = overrides;
    
    const tests = [];
    const emitter = new EventEmitter();
    
    emitter.on('test', (message, fn, {skip, only, extensions, at, validations, timeout}) => {
        tests.push({
            message,
            fn,
            skip,
            only,
            extensions,
            at,
            validations,
            timeout,
        });
    });
    
    emitter.on('loop', () => {
        loop({
            emitter,
            tests,
        });
    });
    
    emitter.on('run', async () => {
        const {harness, formatter} = readyFormatter || await createFormatter(format);
        
        if (!quiet)
            harness.pipe(stream);
        
        const operators = await getOperators();
        
        const result = await runTests(tests, {
            formatter: workerFormatter || formatter,
            operators,
            isStop,
        });
        
        emitter.emit('end', result);
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

const createStream = async () => {
    const {format} = initedOptions;
    const {harness} = await createFormatter(format);
    
    return harness;
};

module.exports.createStream = createStream;
module.exports.createTest = async (testOptions = {}) => {
    const {format = 'tap', formatter} = testOptions;
    const readyFormatter = await _createFormatter(formatter || format);
    
    const stream = new PassThrough();
    const emitter = _createEmitter({
        ...defaultOptions,
        ...testOptions,
        readyFormatter,
        stream,
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
        format,
        quiet,
        getOperators,
        isStop,
        workerFormatter,
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
