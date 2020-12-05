'use strict';

const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');

const test = require('./supertape.js');
const cli = require('./cli');

const {reRequire, stopAll} = mockRequire;

test('supertape: cli: -r', async (t) => {
    const argv = ['-r', 'hello'];
    
    const [error] = await tryToCatch(cli, {
        argv,
        cwd: __dirname,
    });
    
    t.ok(error.message.includes(`Cannot find module 'hello'`));
    t.end();
});

test('supertape: cli: -v', async (t) => {
    const {version} = require('../package');
    const argv = ['-v'];
    const write = stub();
    
    await cli({
        argv,
        cwd: __dirname,
        write,
    });
    
    t.ok(write.calledWith(`v${version}\n`));
    t.end();
});

test('supertape: bin: cli: glob', async (t) => {
    const argv = ['hello'];
    const sync = stub().returns([]);
    
    mockRequire('glob', {
        sync,
    });
    
    const cli = reRequire('./cli');
    await cli({
        argv,
        cwd: __dirname,
    });
    
    stopAll();
    
    t.ok(sync.calledWith('hello'));
    t.end();
});

