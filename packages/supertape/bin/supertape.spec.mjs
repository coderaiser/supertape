import {createRequire} from 'module';
import runsome from 'runsome';
import test from '../lib/supertape.js';

const require = createRequire(import.meta.url);

const name = new URL('supertape.mjs', import.meta.url).pathname;
const run = runsome(name);

test('supertape: bin: -v', (t) => {
    const {version} = require('../package.json');
    
    t.equal(run('-v'), `v${version}`);
    t.end();
});
