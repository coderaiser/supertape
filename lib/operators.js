'use strict';

const deepEqualCheck = require('deep-equal');

const {formatOutput, parseAt} = require('./format');
const diff = require('./diff');

const isStr = (a) => typeof a === 'string';
const {entries} = Object;

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

function equal(expected, actual, message = 'should equal') {
    const is = Object.is(expected, actual);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        expected: true,
        actual,
        message,
        output,
    };
}

function notEqual(expected, actual, message = 'should not equal') {
    const is = !Object.is(expected, actual);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        expected: true,
        actual,
        message,
        output,
    };
}

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

const deepEqual = (expected, actual, message = 'should deep equal') => {
    const is = deepEqualCheck(expected, actual);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        expected,
        actual,
        message,
        output,
    };
};

const notDeepEqual = (expected, actual, message = 'should not deep equal') => {
    const is = !deepEqualCheck(expected, actual);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        expected,
        actual,
        message,
        output,
    };
};

const initOperator = ({out, count, incCount, incPassed, incFailed}) => (name) => (...a) => {
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

const operators = {
    equal,
    notEqual,
    deepEqual,
    notDeepEqual,
    ok,
    notOk,
    pass,
    fail,
    end,
};

module.exports.operators = operators;

module.exports.initOperators = ({out, count, incCount, incPassed, incFailed, extensions}) => {
    const operator = initOperator({
        out,
        count,
        incCount,
        incPassed,
        incFailed,
    });
    
    const extendedOperators = {};
    
    for (const [name, fn] of entries(extensions)) {
        operators[name] = fn(operators);
        extendedOperators[name] = operator(name);
    }
    
    return {
        equal: operator('equal'),
        notEqual: operator('notEqual'),
        deepEqual: operator('deepEqual'),
        notDeepEqual: operator('notDeepEqual'),
        ok: operator('ok'),
        notOk: operator('notOk'),
        pass: operator('pass'),
        fail: operator('fail'),
        comment: comment({out}),
        end,
        
        ...extendedOperators,
    };
};

