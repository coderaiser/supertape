import {test} from 'supertape';

test('supertape: exit-codes', async (t) => {
    const {SKIPPED} = await import('supertape/exit-codes');
    const Original = await import('./exit-codes.js');
    
    t.equal(Original.SKIPPED, SKIPPED);
    t.end();
});

