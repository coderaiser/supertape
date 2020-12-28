'use strict';

const deepEqualCheck = require('deep-equal');

const {formatOutput, parseAt} = require('./format');
const diff = require('./diff');

const {entries} = Object;

// backward compatibility or maybe formatters support
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
        expected: false,
        actual,
        message,
    };
};

function equal(actual, expected, message = 'should equal') {
    const is = Object.is(actual, expected);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        actual,
        expected,
        message,
        output,
    };
}

function notEqual(actual, expected, message = 'should not equal') {
    const is = !Object.is(actual, expected);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        actual,
        expected,
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

const deepEqual = (actual, expected, message = 'should deep equal') => {
    const is = deepEqualCheck(actual, expected);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        actual,
        expected,
        message,
        output,
    };
};

const notDeepEqual = (actual, expected, message = 'should not deep equal') => {
    const is = !deepEqualCheck(actual, expected);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is,
        actual,
        expected,
        message,
        output,
    };
};

const comment = ({formatter}) => (message) => {
    const messages = message.trim().split('\n');
    
    for (const current of messages) {
        const line = current
            .trim()
            .replace(/^#\s*/, '');
        
        formatter.emit('comment', line);
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

const initOperator = ({formatter, count, incCount, incPassed, incFailed}) => (name) => (...a) => {
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
        formatter.emit('test:success', {
            count: count(),
            message,
        });
        return;
    }
    
    incFailed();
    
    const errorStack = stack || Error(message).stack;
    const reason = stack ? 'user' : 'assert';
    
    formatter.emit('test:fail', {
        count: count(),
        message,
        operator: name,
        actual,
        expected,
        output,
        errorStack: formatOutput(errorStack),
        at: parseAt(errorStack, {reason}),
    });
};

module.exports.operators = operators;

module.exports.initOperators = ({formatter, count, incCount, incPassed, incFailed, extensions}) => {
    const operator = initOperator({
        formatter,
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
        comment: comment({formatter}),
        end,
        
        ...extendedOperators,
    };
};

