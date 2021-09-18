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

test('calledWith', (t: Test) => {
    t.calledWith(fn, [a]);
});

test('calledWith', (t: OperatorStub) => {
    t.calledWith(fn, [a]);
});

