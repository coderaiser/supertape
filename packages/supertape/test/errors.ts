import test, {
    test as superTest,
    Test,
    stub,
    Stub,
    extend,
    OperationResult,
    isOnlyTests,
    isSkipTests,
    isFailTests,
    callWhenTestsEnds,
} from '../lib/supertape.js';

// THROWS Expected 2-3 arguments, but got 0
test();

test('hello', (t: Test) => {
    // THROWS Property 'abc' does not exist on type 'Test'.
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
    // THROWS Property 'abc' does not exist on type 'Test'.
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

test.only('hello', (t: Test) => {
    t.end();
// THROWS Type 'string' is not assignable to type 'number'
}, {timeout: 'hello'});

test('hello', (t: Test) => {
    t.end();
// THROWS Object literal may only specify known properties, and 'checkUnknown' does not exist in type 'TestOptions'
}, {checkUnknown: true});

// THROWS Expected 1 arguments, but got 0.
extend();

const extendedTest = extend({
    // THROWS Type 'string' is not assignable to type 'OperatorFactory<OperatorFn>'.
    hello: 'world',
    
    superFail: (operator: Test) => (message: string) => operator.fail(message),
});

// THROWS Expected 2-3 arguments, but got 0.
extendedTest();
extendedTest('hello', (t) => {
    // THROWS Property 'superFail' does not exist on type 'Test'.
    t.superFail('world');
});

const minifyExtension = () => async (pass: () => Promise<OperationResult>) => {
    return await pass();
};

const testAsync = extend({
    minify: minifyExtension,
});

testAsync('hello', async (t) => {
    // THROWS Property 'minify' does not exist on type 'Test'.
    await t.minify();
});

// THROWS Expected 0 arguments, but got 1
isOnlyTests('ss');

// THROWS Type 'boolean' is not assignable to type 'number'.
const x: number = isOnlyTests();

// THROWS Type 'boolean' is not assignable to type 'number'.
const y: number = isSkipTests();
//
// THROWS Type 'boolean' is not assignable to type 'number'.
const z: number = isFailTests();
const f = (...a: number[]) => a;

f(x, y, z);

// THROWS Expected 2 arguments, but got 0.
callWhenTestsEnds();

// THROWS Argument of type '(a: number) => number' is not assignable to parameter of type '() => number | void'.
callWhenTestsEnds('hello', (a: number) => a);
callWhenTestsEnds('hello', () => {});
