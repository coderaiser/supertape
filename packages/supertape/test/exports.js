import {
    test,
    isOnlyTests,
    isSkipTests,
} from 'supertape';
import info from '../package.json' with {
    type: 'json',
};

const isBool = (a) => typeof a === 'boolean';

const isFn = (a) => typeof a === 'function';

test('supertape: exports: bin', (t) => {
    const {exports} = info;
    const result = exports['./bin/supertape'];
    const expected = './bin/supertape.js';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: exports: isOnlyTests', (t) => {
    const result = isFn(isOnlyTests);
    
    t.ok(result);
    t.end();
});

test('supertape: exports: isSkipTests', (t) => {
    const result = isBool(isSkipTests());
    
    t.ok(result);
    t.end();
});
