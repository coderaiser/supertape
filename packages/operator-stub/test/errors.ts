import {stub} from '..';
import {
    test,
    Test,
} from 'supertape';

// THROWS Type 'Function' is not assignable to type 'string'.
const a: string = stub();

const fn = stub();
fn(a);

test('calledWith', (t: Test) => {
    t.calledWith(fn, [a]);
});

