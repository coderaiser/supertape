import runsome from 'runsome';
import {createSimport} from 'simport';

import test from '../lib/supertape.js';

const simport = createSimport(import.meta.url);

const name = new URL('supertape.mjs', import.meta.url).pathname;
const run = runsome(name);

test('supertape: bin: -v', async (t) => {
    const {version} = await simport('../package.json');
    
    t.equal(run('-v'), `v${version}`);
    t.end();
});

