'use strict';

const test = require('./supertape');
const {parseAt} = require('./format');

test('supertape: format', (t) => {
    const stack = `Error: ENOENT: no such file or directory, open '/abc'`;
    const result = parseAt(stack, {reason: 'user'});
    
    t.equal(result, stack);
    t.end();
});

test('supertape: format: reason: exception', (t) => {
    const stack = `
            at file:///Users/coderaiser/estrace/lib/estrace.spec.js:57:11
            at async module.exports (/Users/coderaiser/estrace/node_modules/try-to-catch/lib/try-to-catch.js:7:23)
            at async runOneTest (/Users/coderaiser/estrace/node_modules/supertape/lib/run-tests.js:143:21)
            at async runTests (/Users/coderaiser/estrace/node_modules/supertape/lib/run-tests.js:92:9)
            at async module.exports (/Users/coderaiser/estrace/node_modules/supertape/lib/run-tests.js:55:12)
            at async EventEmitter.<anonymous> (/Users/coderaiser/estrace/node_modules/supertape/lib/supertape.js:69:26)
      `;
    
    const result = parseAt(stack, {reason: 'exception'});
    const expected = 'at file:///Users/coderaiser/estrace/lib/estrace.spec.js:57:11';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: mock-import: ', (t) => {
    const stack = `
            at file:///Users/coderaiser/estrace/lib/estrace.spec.js?mock-import-count=55:57:11
            at async module.exports (/Users/coderaiser/estrace/node_modules/try-to-catch/lib/try-to-catch.js:7:23)
            at async runOneTest (/Users/coderaiser/estrace/node_modules/supertape/lib/run-tests.js:143:21)
            at async runTests (/Users/coderaiser/estrace/node_modules/supertape/lib/run-tests.js:92:9)
            at async module.exports (/Users/coderaiser/estrace/node_modules/supertape/lib/run-tests.js:55:12)
            at async EventEmitter.<anonymous> (/Users/coderaiser/estrace/node_modules/supertape/lib/supertape.js:69:26)
      `;
    
    const result = parseAt(stack, {reason: 'exception'});
    const expected = 'at file:///Users/coderaiser/estrace/lib/estrace.spec.js:57:11';
    
    t.equal(result, expected);
    t.end();
});
