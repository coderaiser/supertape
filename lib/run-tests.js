'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');

const {initOperators} = require('./operators');

const inc = wraptile((store) => store(store() + 1));

module.exports = async function runTests(tests, {reporter}) {
    const count = fullstore(0);
    const failed = fullstore(0);
    const passed = fullstore(0);
    
    const incCount = inc(count);
    const incFailed = inc(failed);
    const incPassed = inc(passed);
    
    reporter.emit('start');
    
    for (const {fn, message, extensions} of tests) {
        await runOneTest({
            message,
            fn,
            reporter,
            count,
            incCount,
            incFailed,
            incPassed,
            extensions,
        });
    }
    
    reporter.emit('end', {
        count: count(),
        passed: passed(),
        failed: failed(),
    });
    
    return {
        count: count(),
        failed: failed(),
        passed: passed(),
    };
};

async function runOneTest({message, fn, extensions, reporter, count, incCount, incPassed, incFailed}) {
    reporter.emit('test', message);
    
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
}

