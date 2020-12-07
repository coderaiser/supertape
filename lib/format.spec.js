'use strict';

const test = require('./supertape');
const {parseAt} = require('./format');

test('supertape: format', (t) => {
    const stack = `Error: ENOENT: no such file or directory, open '/abc'`;
    const result = parseAt(stack, {reason: 'user'});
    
    t.equal(result, stack);
    t.end();
});

