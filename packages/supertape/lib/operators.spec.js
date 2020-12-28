'use strict';

const {once, EventEmitter} = require('events');
const stub = require('@cloudcmd/stub');
const test = require('..');

const {
    initOperators,
    operators,
} = require('./operators');

test('supertape: operators: extendOperators', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a, b, 'should transform code');
        },
    };
    
    const formatter = new EventEmitter();
    const {transformCode} = initOperators(getStubs({formatter, extensions}));
    
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

test('supertape: operators: initOperators: notEqual', async (t) => {
    const formatter = new EventEmitter();
    const {notEqual} = initOperators(getStubs({formatter}));
    
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
    const {notDeepEqual} = initOperators(getStubs({formatter}));
    
    const [[result]] = await Promise.all([
        once(formatter, 'test:success'),
        notDeepEqual({a: 'b'}, {b: 'a'}),
    ]);
    
    const expected = {
        count: 1,
        message: 'should not deep equal',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: operators: equal', (t) => {
    const {equal} = operators;
    const {is} = equal(+0, -0);
    
    t.notOk(is, 'should use Object.is for comparisson');
    t.end();
});

test('supertape: operators: notEqual: true', (t) => {
    const {notEqual} = operators;
    const {is} = notEqual(+0, -0);
    
    t.ok(is, 'should use Object.is for comparisson');
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
    const {is} = notDeepEqual({a: 'b'}, {a: 'b'});
    
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

function getStubs(stubs = {}) {
    const {
        formatter = new EventEmitter(),
        count = stub().returns(1),
        incCount = stub(),
        incPassed = stub(),
        incFailed = stub(),
        extensions = {},
    } = stubs;
    
    return {
        formatter,
        count,
        incCount,
        incPassed,
        incFailed,
        extensions,
    };
}

