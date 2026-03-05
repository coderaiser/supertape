import {test} from 'supertape';
import info from '../package.json' with {
    type: 'json'
}

test('supertape: exports: bin', async (t) => {
    const {exports} = info;
    const result = exports['./bin/supertape'];
    const expected =  './bin/supertape.js';
    t.equal(result, expected)
    t.end();
})
