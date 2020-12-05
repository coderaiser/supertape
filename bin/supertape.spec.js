'use strict';

const {join} = require('path');

const runsome = require('runsome');
const test = require('..');

const name = join(__dirname, 'supertape.js');
const run = runsome(name);

test('supertape: bin: -v', (t) => {
    const {version} = require('../package');
    
    t.equal(run('-v'), `v${version}`);
    t.end();
});

