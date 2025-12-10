import {stripVTControlCharacters} from 'node:util';
import test from './supertape.js';
import diff from './diff.mjs';

const noop = () => {};

test('supertape: diff', (t) => {
    const diffed = diff(undefined, 'hello');
    const {length} = diffed.split('\n');
    const expected = 2;
    
    t.equal(length, expected);
    t.end();
});

test('supertape: diff: no Array', (t) => {
    const result = stripVTControlCharacters(diff(['hello'], []));
    const expected = `
      diff: |-
      - [
      -   "hello",
      - ]
      + []
    `.slice(1, -5);
    
    t.equal(result, expected);
    t.end();
});

test('supertape: diff: no Object', (t) => {
    const result = stripVTControlCharacters(diff({a: 'b'}, {}));
    
    const expected = `
      diff: |-
      - {
      -   "a": "b",
      - }
      + {}
    `.slice(1, -5);
    
    t.equal(result, expected);
    t.end();
});

test('supertape: diff: no diff', (t) => {
    const a = {
        fn: noop,
    };
    
    const b = {
        fn: noop,
    };
    
    const diffed = diff(a, b);
    
    t.notOk(diffed);
    t.end();
});
