'use strict';

const fullstore = require('fullstore');
const wraptile = require('wraptile');
const deepEqualCheck = require('deep-equal');
const tryToCatch = require('try-to-catch');

const {showDiff} = require('./diff');
const {formatOutput} = require('./format');

const count = fullstore(0);
const failed = fullstore(0);
const passed = fullstore(0);

const inc = wraptile((store) => store(store() + 1));

const incCount = inc(count);
const incFailed = inc(failed);
const incPassed = inc(passed);

const isStr = (a) => typeof a === 'string';

module.exports = async function runTests(tests, {out}) {
    out('TAP version 13');
    
    for (const {fn, message} of tests)
        await runOneTest({
            message,
            out,
            fn,
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
    
    clearCounters();
};

function clearCounters() {
    count(0);
    failed(0);
    passed(0);
}

// backward compatibility or maybe emitters support
const end = () => {};

const ok = (actual, message = 'should be truthy') => {
    return {
        is: Boolean(actual),
        expected: true,
        actual,
        message,
    };
};

const notOk = (actual, message = 'should be falsy') => {
    return {
        is: !actual,
        expected: true,
        actual,
        message,
    };
};

const equal = (actual, expected, message = 'should equal') => {
    const is = actual === expected;
    const output = is ? '' : showDiff(expected, actual);
    
    return {
        is,
        expected: true,
        actual,
        message,
        output,
    };
};

const pass = (message = '(unnamed assert)') => {
    return {
        is: true,
        output: '',
        message,
    };
};

const fail = (error) => {
    return {
        is: false,
        stack: error.stack,
        output: '',
        message: error,
    };
};

const deepEqual = (expected, actual, message = 'should equal') => {
    const is = deepEqualCheck(expected, actual);
    const output = is ? '' : showDiff(expected, actual);
    
    return {
        is,
        expected,
        actual,
        message,
        output,
    };
};

const {parse, stringify} = JSON;
const json = (a) => parse(stringify(a));

const jsonEqual = (expected, actual, message = 'should equal') => {
    const {is, output} = deepEqual(json(expected), json(actual));
    
    return {
        is,
        expected,
        actual,
        message,
        output,
    };
};

const operators = {
    equal,
    deepEqual,
    jsonEqual,
    ok,
    notOk,
    pass,
    fail,
    end,
};

const REASON_USER = 1;
const REASON_ASSERT = 2;

const parseAt = (stack, {reason}) => {
    const lines = stack.split('\n');
    const line = lines[reason === 'user' ? REASON_USER : REASON_ASSERT];
    
    return line.trim().replace('at', 'at:');
};

const initOperator = ({out}) => (name) => (...a) => {
    const {
        is,
        message,
        expected,
        actual,
        output,
        stack,
    } = operators[name](...a);
    
    incCount();
    
    if (is) {
        incPassed();
        out(`ok ${count()} ${message}`);
        return;
    }
    
    incFailed();
    
    out(`not ok ${count()} ${message}`);
    out('  ---');
    out(`    operator: ${name}`);
    
    if (output)
        out(output);
    
    if (!isStr(output)) {
        out('    expected: |-');
        out(`      ${expected}`);
        out('    actual: |-');
        out(`      ${actual}`);
    }
    
    const errorStack = stack || Error(message).stack;
    const reason = stack ? 'user' : 'assert';
    
    out(`    ${parseAt(errorStack, {reason})}`);
    out('    stack: |-');
    out(formatOutput(errorStack));
};

const comment = ({out}) => (message) => {
    const messages = message.trim().split('\n');
    
    for (const current of messages) {
        const line = current
            .trim()
            .replace(/^#\s*/, '');
        
        out(`# ${line}`);
    }
};

async function runOneTest({message, out, fn}) {
    out(`# ${message}`);
    
    const operator = initOperator({
        out,
    });
    
    const t = {
        equal: operator('equal'),
        deepEqual: operator('deepEqual'),
        jsonEqual: operator('jsonEqual'),
        ok: operator('ok'),
        notOk: operator('notOk'),
        pass: operator('pass'),
        fail: operator('fail'),
        comment: comment({out}),
        end,
    };
    
    const [error] = await tryToCatch(fn, t);
    
    if (error) {
        t.fail(error);
        t.end();
    }
}

