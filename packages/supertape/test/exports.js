import {
    test,
    isOnlyTests,
    isSkipTests,
    callWhenTestsEnds,
    isFailTests,
} from 'supertape';
import info from '../package.json' with {
    type: 'json',
};

const isNumber = (a) => !Number.isNaN(a) && typeof a === 'number';

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
    const result = isNumber(isSkipTests());
    
    t.ok(result);
    t.end();
});

test('supertape: exports: isFailTests', (t) => {
    const result = isNumber(isFailTests());
    
    t.ok(result);
    t.end();
});

test('supertape: exports: callWhenTestsEnds', (t) => {
    const result = isFn(callWhenTestsEnds);
    
    t.ok(result);
    t.end();
});
