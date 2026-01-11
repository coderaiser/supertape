import {EventEmitter} from 'node:events';
import process from 'node:process';
import {PassThrough} from 'node:stream';
import {stub} from '@cloudcmd/stub';
import once from 'once';
import {maybeOnce} from './maybe-once.js';
import options from '../supertape.json' with {
    type: 'json',
};
import {getAt, setValidations} from './validator.js';
import {createEmitter as _createEmitter} from './emitter.js';
import {createFormatter as _createFormatter} from './formatter/index.js';

const createOnly = (test) => (message, fn, options) => {
    return test(message, fn, {
        ...options,
        only: true,
    });
};

const createSkip = (test) => (message, fn, options) => {
    return test(message, fn, {
        ...options,
        skip: true,
    });
};

const {env} = process;
const {assign} = Object;
const createEmitter = once(_createEmitter);
const createFormatter = once(_createFormatter);

const createExtend = (test) => (extensions) => {
    const extendedTest = getExtend(test, extensions);
    
    assign(extendedTest, {
        test: extendedTest,
        stub,
    });
    
    extendedTest.only = getExtend(test, extensions, {
        only: true,
    });
    
    extendedTest.skip = getExtend(test, extensions, {
        skip: true,
    });
    
    return extendedTest;
};

let mainEmitter;

const getOperators = once(async () => {
    const {operators} = options;
    const {loadOperators} = await import('@supertape/engine-loader');
    
    return await loadOperators(operators);
});

const getDefaultOptions = () => ({
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
    timeout: env.SUPERTAPE_TIMEOUT || 3000,
});

export default test;

const initedOptions = {
    format: 'tap',
};

export const init = (options) => {
    assign(initedOptions, options);
};

export const createStream = async () => {
    const {format} = initedOptions;
    const {harness} = await createFormatter(format);
    
    return harness;
};

export const createTest = async (testOptions = {}) => {
    const {
        format = 'tap',
        formatter,
        isDebug,
    } = testOptions;
    
    const readyFormatter = await _createFormatter(formatter || format);
    
    const stream = new PassThrough();
    const emitter = _createEmitter({
        ...getDefaultOptions(),
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
        extend: createExtend(fn),
        test: fn,
        only: createOnly(fn),
        skip: createSkip(fn),
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
        ...getDefaultOptions(),
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

test.skip = createSkip(test);
test.only = createOnly(test);

const getExtend = (test, extensions, type) => (message, fn, options) => {
    return test(message, fn, {
        extensions,
        ...options,
        ...type,
    });
};

test.stub = stub;
test.test = test;

test.extend = createExtend(test);
export const {extend} = test;

const loop = maybeOnce(({emitter, tests}) => {
    let previousCount = 0;
    
    // 5ms ought to be enough for anybody
    const {
        SUPERTAPE_LOAD_LOOP_TIMEOUT = 5,
    } = env;
    
    (function loop() {
        if (previousCount === tests.length) {
            emitter.emit('run');
            
            return;
        }
        
        previousCount = tests.length;
        setTimeout(loop, SUPERTAPE_LOAD_LOOP_TIMEOUT);
    })();
});

export const run = ({fake} = {}) => {
    if (!mainEmitter || fake)
        return fakeEmitter();
    
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

assign(test, {
    init,
    createStream,
    stub,
    run,
});

export {
    test,
    stub,
};
