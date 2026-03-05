import {test} from 'supertape';
import info from '../package.json' with {
    type: 'json'
}

import {isOnlyTests} from 'supertape';

test('supertape: exports: bin', async (t) => {
    const {exports} = info;
    const result = exports['./bin/supertape'];
    const expected =  './bin/supertape.js';
    t.equal(result, expected)
    t.end();
})

test('supertape: exports: isOnlyTests', async (t) => {
    t.ok(isOnlyTests())
    t.end();
})
