'use strict';

const test = require('..');
const stub = require('@cloudcmd/stub');

const {
    initOperators,
    operators,
} = require('./operators');
const {createOutput} = require('./supertape');

test('supertape: operators: extendOperators', (t) => {
    const out = createOutput();
    
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a, b, 'should transform code');
        },
    };
    
    const {transformCode} = initOperators(getStubs({out, extensions}));
    
    transformCode('a', 'a');
    
    const result = out();
    const expected = 'ok 1 should transform code';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: operators: initOperators: notEqual', (t) => {
    const out = createOutput();
    const {notEqual} = initOperators(getStubs({out}));
    
    notEqual(+0, -0);
    
    const result = out();
    const expected = 'ok 1 should not equal';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: operators: initOperators: notDeepEqual: true', (t) => {
    const out = createOutput();
    const {notDeepEqual} = initOperators(getStubs({out}));
    
    notDeepEqual({a: 'b'}, {b: 'a'});
    
    const result = out();
    const expected = 'ok 1 should not deep equal';
    
    t.equal(result, expected);
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

function getStubs(stubs = {}) {
    const {
        out = stub(),
        count = stub().returns(1),
        incCount = stub(),
        incPassed = stub(),
        incFailed = stub(),
        extensions = {},
    } = stubs;
    
    return {
        out,
        count,
        incCount,
        incPassed,
        incFailed,
        extensions,
    };
}

