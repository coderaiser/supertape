import test, {
    test as superTest,
    Test,
    stub,
    Stub,
    extend,
} from '../lib/supertape.js';

// THROWS Expected 2-3 arguments, but got 0
test();

test('hello', (t: Test) => {
    t.abc();
    t.end();
});

superTest('hello', (t: Test) => {
    t.equal(1, 2);
    t.end();
});

test('stub should be a function', (t) => {
    const fn: Stub = stub();
    fn();
    
    t.calledWithNoArgs(fn);
    t.end();
});

// THROWS Argument of type 'number' is not assignable to parameter of type 'string'.
test.only(123, (t) => {
    t.abc();
});

test.skip('hello', (t: Test) => {
    t.end();
});

test.skip('hello', (t: Test) => {
    t.end();
}, {checkAssertionsCount: false});

test.only('hello', (t: Test) => {
    t.end();
}, {checkDuplicates: false});

test('hello', (t: Test) => {
    t.end();
}, {checkScopes: false});

test('hello', (t: Test) => {
    t.end();
// THROWS Argument of type '{ checkUnknown: boolean; }' is not assignable to parameter of type 'TestOptions'.
}, {checkUnknown: true});

// THROWS Expected 1 arguments, but got 0.
extend();

const extendedTest = extend({
    // THROWS Type 'string' is not assignable to type '(operator: Operator) => (...args: any[]) => OperationResult'.
    hello: 'world',
    
    superFail: ({fail}) => (message) => fail(message),
});

// THROWS Expected 2-3 arguments, but got 0.
extendedTest();
extendedTest('hello', (t) => {
    t.superFail('world');
});

