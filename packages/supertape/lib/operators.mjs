import deepEqualCheck from 'deep-equal';

import diff from './diff.mjs';
import {
    formatOutput,
    parseAt,
} from './format.js';

const {entries} = Object;
const isAsync = (a) => a[Symbol.toStringTag] === 'AsyncFunction';
const maybeRegExp = (a) => isStr(a) ? RegExp(a) : a;

const isFn = (a) => typeof a === 'function';
const isStr = (a) => typeof a === 'string';
const isObj = (a) => typeof a === 'object';

const end = () => {};

const ok = (actual, message = 'should be truthy') => ({
    is: Boolean(actual),
    expected: true,
    actual,
    message,
});

const notOk = (actual, message = 'should be falsy') => ({
    is: !actual,
    expected: false,
    actual,
    message,
});

const validateRegExp = (regexp) => {
    if (!isObj(regexp) && !isStr(regexp))
        return Error('regexp should be RegExp or String');
    
    return null;
};

function match(actual, regexp, message = 'should match') {
    const error = validateRegExp(regexp);
    
    if (error)
        return fail(error);
    
    const is = maybeRegExp(regexp).test(actual);
    
    return {
        is,
        actual,
        expected: regexp,
        message,
    };
}

function notMatch(actual, regexp, message = 'should not match') {
    const {is} = match(actual, regexp, message);
    
    return {
        is: !is,
        actual,
        expected: regexp,
        message,
    };
}

function equal(actual, expected, message = 'should equal') {
    let output = '';
    const is = Object.is(actual, expected);
    
    if (!is)
        output = diff(expected, actual) || '    result: values not equal, but deepEqual';
    
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

const pass = (message = '(unnamed assert)') => ({
    is: true,
    output: '',
    message,
});

const fail = (error, at) => ({
    is: false,
    stack: error.stack,
    output: '',
    message: error,
    at,
});

const deepEqual = (actual, expected, message = 'should deep equal') => {
    const is = deepEqualCheck(actual, expected);
    const output = is ? '' : diff(expected, actual);
    
    return {
        is: is || !output,
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

export const operators = {
    equal,
    notEqual,
    deepEqual,
    notDeepEqual,
    ok,
    notOk,
    pass,
    fail,
    end,
    match,
    notMatch,
};

const initOperator = (runnerState) => (name) => {
    const fn = operators[name];
    
    if (isAsync(fn))
        return async (...a) => {
            const [valid, end] = validateEnd({
                name,
                operators,
                runnerState,
            });
            
            if (!valid)
                return end;
            
            const testState = await fn(...a);
            return run(name, runnerState, testState);
        };
    
    return (...a) => {
        const [valid, end] = validateEnd({
            name,
            operators,
            runnerState,
        });
        
        if (!valid)
            return end;
        
        const testState = fn(...a);
        return run(name, runnerState, testState);
    };
};

const VALID = true;
const INVALID = false;

function validateEnd({name, operators, runnerState}) {
    const {
        isEnded,
        incAssertionsCount,
    } = runnerState;
    
    if (name === 'end' && isEnded())
        return [INVALID, run(
            'fail',
            runnerState,
            operators.fail(`Cannot use a couple 't.end()' operators in one test`),
        )];
    
    if (name === 'end') {
        isEnded(true);
        return [INVALID, end];
    }
    
    incAssertionsCount();
    
    if (isEnded()) {
        return [INVALID, run(
            'fail',
            runnerState,
            operators.fail(`Cannot run assertions after 't.end()' called`),
        )];
    }
    
    return [VALID];
}

const validate = (a) => {
    if (isFn(a))
        return fail('looks like operator returns function, it will always fail');
    
    return a;
};

const returnMissing = () => fail('looks like operator returns nothing, it will always fail');

function run(name, {formatter, count, incCount, incPassed, incFailed}, testState = returnMissing()) {
    const {
        is,
        message,
        expected,
        actual,
        output,
        stack,
        at,
    } = validate(testState);
    
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
    const reason = stack ? 'exception' : 'user';
    
    formatter.emit('test:fail', {
        count: count(),
        message,
        operator: name,
        actual,
        expected,
        output,
        errorStack: formatOutput(errorStack),
        at: at || parseAt(errorStack, {reason}),
    });
}

export const initOperators = ({formatter, count, incCount, incPassed, incFailed, incAssertionsCount, isEnded, extensions}) => {
    const operator = initOperator({
        formatter,
        count,
        incCount,
        incPassed,
        incFailed,
        isEnded,
        incAssertionsCount,
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
        match: operator('match'),
        notMatch: operator('notMatch'),
        end: operator('end'),
        
        ...extendedOperators,
    };
};

