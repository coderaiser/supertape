'use strict';

const tryTo = require('try-to-tape');
const tape = tryTo(require('tape'));
const diff = require('jest-diff').default;
const strip = require('strip-ansi');
const deepEqual = require('deep-equal');

const wrap = (test) => async (str, fn) => {
    await test(str, async (t) => {
        t.equal = equal(t, t.equal);
        t.deepEqual = getDeepEqual(t, t.deepEqual);
        t.jsonEqual = getJsonEqual(t);
        
        await fn(t);
    });
};

const getNewTape = (tape) => {
    const newTape = wrap(tape);
    
    newTape.only = wrap(tape.only);
    newTape.skip = wrap(tape.skip);
    
    return newTape;
};

const equal = (t, equal) => (a, b, msg) => {
    const {comment} = t;
    equal(a, b, msg);
    showDiff(a, b, comment);
};

const getDeepEqual = (t, deepEqual) => (a, b, msg) => {
    const {comment} = t;
    deepEqual(a, b, msg);
    showDiff(a, b, comment);
};

const json = (a) => JSON.parse(JSON.stringify(a));

const getJsonEqual = (t) => (a, b, msg) => {
    const {comment} = t;
    const is = deepEqual(json(a), json(b));
    
    if (is) {
        t.pass(msg);
    } else {
        t.fail(msg);
        showDiff(json(a), json(b), comment);
    }
};

module.exports = getNewTape(tape);

function showDiff(a, b, log) {
    const diffed = diff(b, a);
    
    if (diffed && strip(diffed) !== 'Compared values have no visual difference.')
        log(diffed);
}

