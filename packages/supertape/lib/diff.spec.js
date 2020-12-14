'use strict';

const test = require('..');
const diff = require('./diff');

test('supertape: diff', (t) => {
    const diffed = diff(undefined, 'hello');
    const {length} = diffed.split('\n');
    const expected = 2;
    
    t.equal(length, expected);
    t.end();
});

