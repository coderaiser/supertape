'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const tryToCatch = require('try-to-catch');

const {initOperators} = require('./operators');

const inc = wraptile((store) => store(store() + 1));

module.exports = async function runTests(tests, {out}) {
    const count = fullstore(0);
    const failed = fullstore(0);
    const passed = fullstore(0);
    
    const incCount = inc(count);
    const incFailed = inc(failed);
    const incPassed = inc(passed);
    
    out('TAP version 13');
    
    for (const {fn, message, extensions = {}} of tests)
        await runOneTest({
            message,
            fn,
            out,
            count,
            incCount,
            incFailed,
            incPassed,
            extensions,
        });
    
    out('');
    out(`1..${count()}`);
    out(`# tests ${count()}`);
    out(`# pass ${passed()}`);
    
    if (failed())
        out(`# fail ${failed()}`);
    
    out('');
    
    if (!failed())
        out('# ok');
    
    out('');
};

async function runOneTest({message, fn, extensions, out, count, incCount, incPassed, incFailed}) {
    out(`# ${message}`);
    
    const t = initOperators({
        out,
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

