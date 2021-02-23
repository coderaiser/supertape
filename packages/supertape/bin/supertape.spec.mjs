import {join} from 'path';

import runsome from 'runsome';
import {
    createCommons,
    createSimport,
} from 'simport';

import test from '../lib/supertape.js';

const {__dirname} = createCommons(import.meta.url);
const simport = createSimport(import.meta.url);

const name = join(__dirname, 'supertape.mjs');
const run = runsome(name);

test('supertape: bin: -v', async (t) => {
    const {version} = await simport('../package.json');
    
    t.equal(run('-v'), `v${version}`);
    t.end();
});

