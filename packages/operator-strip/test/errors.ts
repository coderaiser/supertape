import {type Test, extend} from 'supertape';
import * as strip from '../lib/strip.js';

const test = extend(strip);

test('calledWith', (t: Test) => {
    // THROWS Argument of type 'number' is not assignable to parameter of type 'string'.
    t.stripEqual(1, 2, 34);
    t.hello();
    t.end();
});
