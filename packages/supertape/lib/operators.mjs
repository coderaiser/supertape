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

const ok = (result, message = 'should be truthy') => ({
    is: Boolean(result),
    expected: true,
    result,
    message,
});

const notOk = (result, message = 'should be falsy') => ({
    is: !result,
    expected: false,
    result: result && stringify(result),
    message,
});

const validateRegExp = (regexp) => {
    if (!isObj(regexp) && !isStr(regexp))
        return Error('regexp should be RegExp or String');
    
    if (!regexp)
        return Error('regexp cannot be empty');
    
    return null;
};

const {stringify} = JSON;

function match(result, regexp, message = 'should match') {
    const error = validateRegExp(regexp);
    
    if (error)
        return fail(error);
    
    const is = maybeRegExp(regexp).test(result);
    
    return {
        is,
        result,
        expected: regexp,
        message,
    };
}

function notMatch(result, regexp, message = 'should not match') {
    const {is} = match(result, regexp, message);
    
    return {
        is: !is,
        result,
        expected: regexp,
        message,
    };
}

function equal(result, expected, message = 'should equal') {
    let output = '';
    const is = Object.is(result, expected);
    
    if (!is)
        output = diff(expected, result) || '    result: values not equal, but deepEqual';
    
    return {
        is,
        result,
        expected,
        message,
        output,
    };
}

function notEqual(result, expected, message = 'should not equal') {
    const is = !Object.is(result, expected);
    const output = is ? '' : diff(expected, result);
    
    return {
        is,
        result,
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

const deepEqual = (result, expected, message = 'should deep equal') => {
    const is = deepEqualCheck(result, expected);
    const output = is ? '' : diff(expected, result);
    
    return {
        is: is || !output,
        result,
        expected,
        message,
        output,
    };
};

const notDeepEqual = (result, expected, message = 'should not deep equal') => {
    const is = !deepEqualCheck(result, expected);
    const output = is ? '' : diff(expected, result);
    
    return {
        is,
        result,
        expected,
        message,
        output,
    };
};

const comment = ({formatter}) => (message) => {
    const messages = message
        .trim()
        .split('\n');
    
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
            run(name, runnerState, testState);
            
            return testState;
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
        run(name, runnerState, testState);
        
        return testState;
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
        return [INVALID, run('fail', runnerState, operators.fail(`Cannot use a couple 't.end()' operators in one test`))];
    
    if (name === 'end') {
        isEnded(true);
        return [INVALID, end];
    }
    
    incAssertionsCount();
    
    if (isEnded()) {
        return [INVALID, run('fail', runnerState, operators.fail(`Cannot run assertions after 't.end()' called`))];
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
        result,
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
        result,
        expected,
        output,
        errorStack: formatOutput(errorStack),
        at: at || parseAt(errorStack, {
            reason,
        }),
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
        comment: comment({
            formatter,
        }),
        match: operator('match'),
        notMatch: operator('notMatch'),
        end: operator('end'),
        
        ...extendedOperators,
    };
};
