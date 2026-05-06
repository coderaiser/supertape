import {Test, extend} from 'supertape';
import * as react from '../lib/react.js';

const test = extend(react);

test('hasText', (t: Test) => {
    // THROWS Argument of type 'number' is not assignable to parameter of type 'ReactElement<unknown, string | JSXElementConstructor<any>>'
    t.hasText(1, 2);
    t.end();
});

test('hasClassName', (t: Test) => {
    // THROWS Argument of type 'number' is not assignable to parameter of type 'ReactElement<unknown, string | JSXElementConstructor<any>>'
    t.hasClassName(1, 2);
    t.end();
});

test('matchClassName', (t: Test) => {
    // THROWS Argument of type 'number' is not assignable to parameter of type 'ReactElement<unknown, string | JSXElementConstructor<any>>'
    t.matchClassName(1, 2);
    t.end();
});
