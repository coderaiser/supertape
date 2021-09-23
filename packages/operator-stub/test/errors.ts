import {OperatorStub} from '../lib/stub.js';
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
});

test('calledWith', (t: OperatorStub) => {
    t.calledWith(fn, [a]);
});

test('calledAfter', (t: OperatorStub) => {
    t.calledAfter(fn1, fn2);
});

test('calledBefore', (t: OperatorStub) => {
    t.calledBefore(fn1, fn2);
});

test('calledInOrder', (t: OperatorStub) => {
    t.calledInOrder([fn1, fn2]);
});

test('calledInOrder: not stub', (t: OperatorStub) => {
    // THROWS Type '() => void' is not assignable to type 'Stub'.
    t.calledInOrder([() => {}]);
});

