'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');
const once = require('once');

const isDebug = require('./is-debug');
const {createValidator} = require('./validator');

const inc = wraptile((store) => store(store() + 1));
const isOnly = ({only}) => only;
const isSkip = ({skip}) => skip;
const notSkip = ({skip}) => !skip;

const getInitOperators = once(async () => {
    const {initOperators} = await import('./operators.mjs');
    return initOperators;
});

const {
    SUPERTAPE_TIMEOUT = 3000,
} = process.env;

const DEBUG_TIME = 3000 * 1000;

const timeout = (time, value) => {
    let stop;
    
    if (isDebug)
        time = DEBUG_TIME;
    
    const promise = new Promise((resolve) => {
        const id = setTimeout(resolve, time, value);
        stop = clearTimeout.bind(null, id);
    });
    
    return [promise, stop];
};

module.exports = async (tests, {formatter, operators, isStop}) => {
    const onlyTests = tests.filter(isOnly);
    
    if (onlyTests.length)
        return await runTests(onlyTests, {
            formatter,
            operators,
            skiped: tests.length - onlyTests.length,
            isStop,
        });
    
    const notSkipedTests = tests.filter(notSkip);
    const skiped = tests.filter(isSkip).length;
    
    return await runTests(notSkipedTests, {
        formatter,
        operators,
        skiped,
        isStop,
    });
};

async function runTests(tests, {formatter, operators, skiped, isStop}) {
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
    
    for (const {fn, message, extensions} of tests) {
        if (wasStop())
            break;
        
        if (isStop()) {
            wasStop(true);
            count(total - 1);
        }
        
        await runOneTest({
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
        skiped,
    });
    
    return {
        count: count(),
        failed: failed(),
        passed: passed(),
        skiped,
    };
}

async function runOneTest({message, fn, extensions, formatter, count, total, failed, incCount, incPassed, incFailed, getValidationMessage}) {
    formatter.emit('test', {
        test: message,
    });
    
    const initOperators = await getInitOperators();
    const t = initOperators({
        formatter,
        count,
        incCount,
        incPassed,
        incFailed,
        extensions,
    });
    
    const [timer, stopTimer] = timeout(SUPERTAPE_TIMEOUT, ['timeout']);
    
    const [error] = await Promise.race([
        tryToCatch(fn, t),
        timer,
    ]);
    
    stopTimer();
    
    if (error) {
        t.fail(error);
        t.end();
    }
    
    formatter.emit('test:end', {
        count: count(),
        total,
        test: message,
        failed: failed(),
    });
    
    const [validationMessage, at] = getValidationMessage(message);
    
    if (at) {
        t.fail(validationMessage, at);
        t.end();
    }
}
