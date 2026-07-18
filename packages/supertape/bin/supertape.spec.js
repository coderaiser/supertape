import {createRequire} from 'node:module';
import {runsome} from 'runsome';
import test from '../lib/supertape.js';

const require = createRequire(import.meta.url);

const name = new URL('tracer.js', import.meta.url).pathname;
const run = runsome(name);

test('supertape: bin: -v', (t) => {
    const {version} = require('../package.json');
    const result = run('-v');
    const expected = `v${version}`;
    
    t.equal(result, expected);
    t.end();
});
