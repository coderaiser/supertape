'use strict';

const {join} = require('path');

const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');

const test = require('./supertape.js');
const cli = require('./cli');

const {reRequire, stopAll} = mockRequire;
const {assign} = Object;

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

test('supertape: bin: cli: glob: a couple', async (t) => {
    const argv = ['hello', 'world'];
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
    
    const [[first], [second]] = sync.args;
    
    t.deepEqual([first, second], ['hello', 'world'], 'should call glob.sync on every iteration');
    t.end();
});

test('supertape: bin: cli: loop', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [name, name];
    
    const test = stub();
    const init = stub();
    const loop = stub();
    
    assign(test, {
        init,
        loop,
    });
    mockRequire('./supertape', test);
    
    const cli = reRequire('./cli');
    await cli({
        argv,
        cwd: __dirname,
    });
    
    stopAll();
    
    t.equal(loop.callCount, 1, 'loop always called once');
    t.end();
});

test('supertape: bin: cli: loop', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [name, name];
    
    const test = stub();
    const init = stub();
    const loop = stub();
    
    assign(test, {
        init,
        loop,
    });
    mockRequire('./supertape', test);
    
    const cli = reRequire('./cli');
    await cli({
        argv,
        cwd: __dirname,
    });
    
    stopAll();
    
    t.equal(loop.callCount, 1, 'test always called once');
    t.end();
});

test('supertape: bin: cli: files count', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [name, name];
    
    const test = stub();
    const init = stub();
    const loop = stub();
    
    assign(test, {
        init,
        loop,
    });
    
    mockRequire('./supertape', test);
    
    const cli = reRequire('./cli');
    await cli({
        argv,
        cwd: __dirname,
    });
    
    const result = cli._filesCount();
    const expected = 1;
    
    stopAll();
    
    t.equal(result, expected, 'should process 1 file');
    t.end();
});

