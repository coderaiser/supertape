'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');

const {initOperators} = require('./operators');

const inc = wraptile((store) => store(store() + 1));
const isOnly = ({only}) => only;
const isSkip = ({skip}) => skip;
const notSkip = ({skip}) => !skip;

module.exports = async (tests, {reporter, operators}) => {
    const onlyTests = tests.filter(isOnly);
    const skiped = tests.filter(isSkip).length;
    
    if (onlyTests.length)
        return await runTests(onlyTests, {
            reporter,
            operators,
            skiped,
        });
    
    const notSkipedTests = tests.filter(notSkip);
    
    return await runTests(notSkipedTests, {
        reporter,
        operators,
        skiped,
    });
};

async function runTests(tests, {reporter, operators, skiped}) {
    const count = fullstore(0);
    const failed = fullstore(0);
    const passed = fullstore(0);
    
    const incCount = inc(count);
    const incFailed = inc(failed);
    const incPassed = inc(passed);
    
    const total = tests.length;
    
    reporter.emit('start', {
        total,
    });
    
    for (let index = 0; index < total; index++) {
        const {
            fn,
            message,
            extensions,
        } = tests[index];
        
        await runOneTest({
            fn,
            message,
            index,
            total,
            reporter,
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
    
    reporter.emit('end', {
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

async function runOneTest({message, fn, extensions, index, total, reporter, count, failed, incCount, incPassed, incFailed}) {
    reporter.emit('test', {
        message,
    });
    
    const t = initOperators({
        reporter,
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
    
    reporter.emit('test:end', {
        index,
        total,
        message,
        failed: failed(),
    });
}

