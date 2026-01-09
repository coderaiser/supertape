import {tryCatch} from 'try-catch';
import montag from 'montag';
import test from './supertape.js';
import {parseAt} from './format.js';

test('supertape: format', (t) => {
    const stack = `Error: ENOENT: no such file or directory, open '/abc'`;
    const result = parseAt(stack, {
        reason: 'user',
    });
    
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
    
    const result = parseAt(stack, {
        reason: 'exception',
    });
    
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
    
    const result = parseAt(stack, {
        reason: 'exception',
    });
    
    const expected = 'at file:///Users/coderaiser/estrace/lib/estrace.spec.js:57:11';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: parseAt: less then 4', (t) => {
    const stack = montag`
        Error: should deep equal
            at run (file:///Users/coderaiser/putout/node_modules/supertape/lib/operators.mjs:275:33)
            at validateEnd.name.name (file:///Users/coderaiser/putout/node_modules/supertape/lib/operators.mjs:190:13)'
      `;
    
    const [error] = tryCatch(parseAt, stack, {
        reason: 'user',
    });
    
    const expected = 'Error: should deep equal';
    
    t.match(error.message, expected);
    t.end();
});

test('supertape: format: parseAt: looks like empty', (t) => {
    const stack = montag`
        Error: ☝️Looks like provided fixture cannot be parsed: 'const foo1 =
            // comment
            <T, >() => () => 1;
        
        const foo1 =
            // sdf
            5'
            at run (operators.mjs:272:33)
            at Object.print (operators.mjs:207:9)
            at comment.spec.js:322:7
            at module.exports (try-to-catch.js:7:29)
            at runOneTest (run-tests.js:165:45)
            at async runTests (run-tests.js:83:9)
            at async module.exports (run-tests.js:37:16)
            at async EventEmitter.<anonymous> (supertape.js:85:24)
      `;
    
    const result = parseAt(stack, {
        reason: 'user',
    });
    
    const expected = `Error: ☝️Looks like provided fixture cannot be parsed: 'const foo1 =`;
    
    t.match(result, expected);
    t.end();
});
