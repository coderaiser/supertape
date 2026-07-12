import {test} from 'supertape';
import {tsToJs} from '../lib/ts.js';

test('supertape: loader-ts: exports: tsToJs', async (t) => {
    const result = await import('@supertape/loader-ts/ts');
    
    t.equal(result.tsToJs, tsToJs);
    t.end();
});
