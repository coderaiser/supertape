'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');

const {initOperators} = require('./operators');

const inc = wraptile((store) => store(store() + 1));
const isOnly = ({only}) => only;
const isSkip = ({skip}) => skip;
const notSkip = ({skip}) => !skip;

module.exports = async (tests, {formatter, operators, isStop}) => {
    const onlyTests = tests.filter(isOnly);
    const skiped = tests.filter(isSkip).length;
    
    if (onlyTests.length)
        return await runTests(onlyTests, {
            formatter,
            operators,
            skiped,
            isStop,
        });
    
    const notSkipedTests = tests.filter(notSkip);
    
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
            total,
            formatter,
            count,
            failed,
            incCount,
            incFailed,
            incPassed,
            
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

async function runOneTest({message, fn, extensions, total, formatter, count, failed, incCount, incPassed, incFailed}) {
    formatter.emit('test', {
        test: message,
    });
    
    const t = initOperators({
        formatter,
        count,
        incCount,
        incPassed,
        incFailed,
        extensions,
    });
    
    const [error] = await tryToCatch(fn, t);
    
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
}

