import test from './supertape.js';
import diff from './diff.mjs';

test('supertape: diff', (t) => {
    const diffed = diff(undefined, 'hello');
    const {length} = diffed.split('\n');
    const expected = 2;
    
    t.equal(length, expected);
    t.end();
});

test('supertape: diff: no diff', (t) => {
    const a = {
        fn: () => {},
    };
    
    const b = {
        fn: () => {},
    };
    
    const diffed = diff(a, b);
    
    t.notOk(diffed);
    t.end();
});

