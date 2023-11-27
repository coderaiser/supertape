import {
    once,
    EventEmitter,
} from 'node:events';
import stub from '@cloudcmd/stub';
import test from './supertape.js';
import {
    initOperators,
    operators,
} from './operators.mjs';

const noop = () => {};

const {stringify} = JSON;

test('supertape: operators: extendOperators', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a, b, 'should transform code');
        },
    };
    
    const formatter = new EventEmitter();
    const {transformCode} = initOperators(getStubs({
        formatter,
        extensions,
    }));
    
    const [[result]] = await Promise.all([
        once(formatter, 'test:success'),
        transformCode('a', 'a'),
    ]);
    
    const expected = {
        count: 1,
        message: 'should transform code',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: operators: returns', (t) => {
    const result = t.equal('a', 'a');
    
    t.equal(result.message, 'should equal');
    t.end();
}, {
    checkAssertionsCount: false,
});

test('supertape: operators: extendOperators: async: returns', async (t) => {
    const extensions = {
        transformCode: (t) => async (a, b) => {
            return await t.equal(a, b, 'should transform code');
        },
    };
    
    const formatter = new EventEmitter();
    const {transformCode} = initOperators(getStubs({
        formatter,
        extensions,
    }));
    
    const [result] = await Promise.all([
        transformCode('a', 'a'),
        once(formatter, 'test:success'),
    ]);
    
    t.equal(result.message, 'should transform code');
    t.end();
});

test('supertape: operators: initOperators: notEqual', async (t) => {
    const formatter = new EventEmitter();
    const {notEqual} = initOperators(getStubs({
        formatter,
    }));
    
    const [[result]] = await Promise.all([
        once(formatter, 'test:success'),
        notEqual(+0, -0),
    ]);
    
    const expected = {
        count: 1,
        message: 'should not equal',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: operators: initOperators: notDeepEqual: true', async (t) => {
    const formatter = new EventEmitter();
    const {notDeepEqual} = initOperators(getStubs({
        formatter,
    }));
    
    const [[result]] = await Promise.all([
        once(formatter, 'test:success'),
        notDeepEqual({a: 'b'}, {
            b: 'a',
        }),
    ]);
    
    const expected = {
        count: 1,
        message: 'should not deep equal',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: operators: deepEqual: no visual differences', async (t) => {
    const formatter = new EventEmitter();
    const {deepEqual} = initOperators(getStubs({
        formatter,
    }));
    
    const a = {
        fn: noop,
    };
    
    const b = {
        fn: noop,
    };
    
    const [[result]] = await Promise.all([
        once(formatter, 'test:success'),
        deepEqual(a, b),
    ]);
    
    const expected = {
        count: 1,
        message: 'should deep equal',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: operators: equal', (t) => {
    const {equal} = operators;
    const {is} = equal(+0, -0);
    
    t.notOk(is, 'should use Object.is for comparison');
    t.end();
});

test('supertape: operators: notEqual: true', (t) => {
    const {notEqual} = operators;
    const {is} = notEqual(+0, -0);
    
    t.ok(is, 'should use Object.is for comparison');
    t.end();
});

test('supertape: operators: notEqual: false', (t) => {
    const {notEqual} = operators;
    const {is} = notEqual(1, 1);
    
    t.notOk(is);
    t.end();
});

test('supertape: operators: notDeepEqual: false', (t) => {
    const {notDeepEqual} = operators;
    const {is} = notDeepEqual({a: 'b'}, {
        a: 'b',
    });
    
    t.notOk(is);
    t.end();
});

test('supertape: operators: notDeepEqual: true', (t) => {
    const {notDeepEqual} = operators;
    const {is} = notDeepEqual(1, 1);
    
    t.notOk(is);
    t.end();
});

test('supertape: operators: notOk: false', (t) => {
    const {notOk} = operators;
    const {expected} = notOk(false);
    
    t.notOk(expected);
    t.end();
});

test('supertape: operators: notOk: object', (t) => {
    const {notOk} = operators;
    const {result} = notOk({
        hello: 'world',
    });
    
    const expected = stringify({
        hello: 'world',
    });
    
    t.equal(result, expected);
    t.end();
});

test('supertape: operators: match: not RegExp and String', (t) => {
    const {match} = operators;
    const {message} = match('hello', 5);
    
    t.equal(message.message, 'regexp should be RegExp or String');
    t.end();
});

test('supertape: operators: match: empty', (t) => {
    const {match} = operators;
    const {message} = match('hello', '');
    
    t.equal(message.message, 'regexp cannot be empty');
    t.end();
});

test('supertape: operators: match: empty string: not ok', (t) => {
    const {match} = operators;
    const {expected} = match('hello', '');
    
    t.notOk(expected);
    t.end();
});

test('supertape: operators: match: string', (t) => {
    const {match} = operators;
    const {is} = match('hello', 'world');
    
    t.notOk(is);
    t.end();
});

test('supertape: operators: not match: string', (t) => {
    const {notMatch} = operators;
    const {is} = notMatch('hello', 'world');
    
    t.ok(is);
    t.end();
});

test('supertape: operators: not match: message', (t) => {
    const {notMatch} = operators;
    const {message} = notMatch('hello', 'world');
    
    t.equal(message, 'should not match');
    t.end();
});

test('supertape: operators: not match', (t) => {
    const {notMatch} = operators;
    const {is} = notMatch('hello', /world/);
    
    t.ok(is);
    t.end();
});

test('supertape: operators: match: not', (t) => {
    const {match} = operators;
    const {is} = match('hello', /world/);
    
    t.notOk(is);
    t.end();
});

test('supertape: operators: match', (t) => {
    const {match} = operators;
    const {is} = match('hello', /hello/);
    
    t.ok(is);
    t.end();
});

test('supertape: operators: end', (t) => {
    const {end} = operators;
    const result = end();
    
    t.notOk(result);
    t.end();
});

function getStubs(stubs = {}) {
    const {
        formatter = new EventEmitter(),
        count = stub().returns(1),
        incCount = stub(),
        incPassed = stub(),
        incFailed = stub(),
        incAssertionsCount = stub(),
        isEnded = stub(),
        extensions = {},
    } = stubs;
    
    return {
        formatter,
        count,
        incCount,
        incPassed,
        incFailed,
        isEnded,
        incAssertionsCount,
        extensions,
    };
}
