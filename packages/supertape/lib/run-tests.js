'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const {tryToCatch} = require('try-to-catch');
const _isDebug = require('./is-debug');

const {createValidator} = require('./validator');

const inc = wraptile((store) => store(store() + 1));
const isOnly = ({only}) => only;
const isSkip = ({skip}) => skip;
const notSkip = ({skip}) => !skip;
const parseTime = (a) => a === 'undefined' ? 1 : a;

const getInitOperators = async () => await import('./operators.mjs');

const DEBUG_TIME = 3000 * 1000;

const doTimeout = (time, value, {isDebug}) => {
    let stop;
    
    if (isDebug)
        time = DEBUG_TIME;
    
    const promise = new Promise((resolve) => {
        const id = setTimeout(resolve, parseTime(time), value);
        stop = clearTimeout.bind(null, id);
    });
    
    return [promise, stop];
};

module.exports = async (tests, overrides = {}) => {
    const {
        formatter,
        operators,
        isStop,
        isDebug = _isDebug,
    } = overrides;
    
    const onlyTests = tests.filter(isOnly);
    
    if (onlyTests.length)
        return await runTests(onlyTests, {
            formatter,
            operators,
            skipped: tests.length - onlyTests.length,
            isStop,
        });
    
    const notSkippedTests = tests.filter(notSkip);
    const skipped = tests.filter(isSkip).length;
    
    return await runTests(notSkippedTests, {
        formatter,
        operators,
        skipped,
        isStop,
        isDebug,
    });
};

async function runTests(tests, overrides = {}) {
    const {
        formatter,
        operators,
        skipped,
        isStop,
        isDebug,
    } = overrides;
    
    const count = fullstore(0);
    const failed = fullstore(0);
    const passed = fullstore(0);
    const incCount = inc(count);
    const incFailed = inc(failed);
    const incPassed = inc(passed);
    const total = tests.length;
    
    formatter.emit('start', {
        total,
    });
    
    const wasStop = fullstore();
    
    const getValidationMessage = createValidator({
        tests,
    });
    
    for (const {fn, message, timeout, extensions, at, validations} of tests) {
        if (wasStop())
            break;
        
        if (isStop()) {
            wasStop(true);
            count(total - 1);
        }
        
        await runOneTest({
            at,
            fn,
            message,
            formatter,
            count,
            total,
            failed,
            incCount,
            incFailed,
            incPassed,
            getValidationMessage,
            validations,
            timeout,
            isDebug,
            extensions: {
                ...operators,
                ...extensions,
            },
        });
    }
    
    formatter.emit('end', {
        count: count(),
        failed: failed(),
        passed: passed(),
        skipped,
    });
    
    return {
        count: count(),
        failed: failed(),
        passed: passed(),
        skipped,
    };
}

async function runOneTest(options) {
    const {
        message,
        at,
        fn,
        extensions,
        formatter,
        count,
        total,
        failed,
        incCount,
        incPassed,
        incFailed,
        getValidationMessage,
        validations,
        timeout,
        isDebug,
    } = options;
    
    const isReturn = fullstore(false);
    const assertionsCount = fullstore(0);
    const isEnded = fullstore(false);
    const incAssertionsCount = inc(assertionsCount);
    
    formatter.emit('test', {
        test: message,
    });
    
    const {initOperators} = await getInitOperators();
    const {checkIfEnded} = validations;
    
    const t = initOperators({
        formatter,
        count,
        incCount,
        incPassed,
        incFailed,
        assertionsCount,
        incAssertionsCount,
        isEnded,
        extensions,
        checkIfEnded,
    });
    
    if (!isReturn()) {
        const [timer, stopTimer] = doTimeout(timeout, ['timeout'], {
            isDebug,
        });
        
        const [error] = await Promise.race([tryToCatch(fn, t), timer]);
        
        stopTimer();
        isEnded(false);
        
        if (error) {
            t.fail(error, at);
            t.end();
            isReturn(true);
        }
    }
    
    if (!isReturn()) {
        const [validationMessage, atLine] = getValidationMessage(message, {
            assertionsCount: assertionsCount(),
        });
        
        if (atLine) {
            t.fail(validationMessage, atLine);
            t.end();
        }
    }
    
    formatter.emit('test:end', {
        count: count(),
        total,
        test: message,
        failed: failed(),
    });
}

module.exports.parseTime = parseTime;
