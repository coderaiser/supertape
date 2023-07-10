import {
    stub,
    Stub,
} from '@cloudcmd/stub';
import {
    test,
    Test,
} from 'supertape';

// THROWS Type 'Stub' is not assignable to type 'string'.
const a: string = stub();

const fn: Stub = stub();
fn(a);

const fn1: Stub = stub();
const fn2: Stub = stub();

test('calledWith', (t: Test) => {
    t.calledWith(fn, [a]);
    t.end();
});

test('calledWith', (t: Test) => {
    t.calledWith(fn, [a]);
    t.end();
});

test('calledAfter', (t: Test) => {
    t.calledAfter(fn1, fn2);
    t.end();
});

test('calledBefore', (t: Test) => {
    t.calledBefore(fn1, fn2);
    t.end();
});

test('calledInOrder', (t: Test) => {
    t.calledInOrder([fn1, fn2]);
    t.end();
});

test('calledInOrder: not stub', (t: Test) => {
    // THROWS Type 'FunctionConstructor' is not assignable to type 'Stub'.
    t.calledInOrder([Function]);
    t.end();
});
