import {test} from 'supertape';

test('supertape: exit-codes', async (t) => {
    const {SKIPED} = await import('supertape/exit-codes');
    const Original = await import('./exit-codes.js');
    
    t.equal(Original.SKIPED, SKIPED);
    t.end();
});
