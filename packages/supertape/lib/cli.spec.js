'use strict';

const {join} = require('path');
const {Transform} = require('stream');
const {EventEmitter} = require('events');
const {readFile} = require('fs/promises');

const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const tryToCatch = require('try-to-catch');
const pullout = require('pullout');
const wait = require('@iocmd/wait');

const test = require('./supertape.js');
const {exitCodes} = require('./exit');

const {
    OK,
    WAS_STOP,
} = exitCodes;

const {reRequire, stopAll} = mockRequire;
const {assign} = Object;

test('supertape: cli: -r', async (t) => {
    const argv = ['-r', 'hello'];
    const write = stub();
    const stderr = {
        write,
    };
    
    await runCli({
        argv,
        stderr,
    });
    
    const [[message]] = write.args;
    
    t.ok(message.includes(`Cannot find module 'hello'`));
    t.end();
});

test('supertape: cli: -v', async (t) => {
    const {version} = require('../package');
    const argv = ['-v'];
    const stdout = createStream();
    
    await runCli({
        argv,
        stdout,
    });
    
    stdout.push(null);
    const result = await pullout(stdout);
    
    t.equal(result, `v${version}\n`);
    t.end();
});

test('supertape: bin: cli: glob', async (t) => {
    const argv = ['hello'];
    const sync = stub().returns([]);
    
    mockRequire('glob', {
        sync,
    });
    
    await runCli({
        argv,
    });
    
    stopAll();
    
    t.calledWith(sync, ['hello']);
    t.end();
});

test('supertape: bin: cli: glob: a couple', async (t) => {
    const argv = ['hello', 'world'];
    const sync = stub().returns([]);
    
    mockRequire('glob', {
        sync,
    });
    
    await runCli({
        argv,
    });
    
    stopAll();
    
    const [[first], [second]] = sync.args;
    
    t.deepEqual([first, second], ['hello', 'world'], 'should call glob.sync on every iteration');
    t.end();
});

test('supertape: bin: cli: run', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [name, name];
    
    const test = stub();
    const init = stub();
    const run = stub();
    
    const {createStream} = reRequire('..');
    
    assign(test, {
        init,
        run,
        createStream,
    });
    
    mockRequire('..', test);
    
    await runCli({
        argv,
    });
    
    stopAll();
    
    t.equal(run.callCount, 1, 'run always called once');
    t.end();
});

test('supertape: bin: cli: run: not test', async (t) => {
    const name = join(__dirname, 'fixture/not-test.js');
    const argv = [name];
    
    reRequire('./supertape');
    const [error] = await runCli({
        argv,
    });
    
    stopAll();
    
    t.notOk(error, 'should not be an error');
    t.end();
});

test('supertape: bin: cli: files count', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [name, name];
    
    const emitter = new EventEmitter();
    
    const test = stub();
    const init = stub();
    const run = stub().returns(emitter);
    
    assign(test, {
        init,
        run,
        createStream,
    });
    
    mockRequire('./supertape', test);
    
    const emit = emitter.emit.bind(emitter);
    const [[error, cli]] = await Promise.all([
        runCli({
            argv,
        }),
        wait(emit, 'end', {failed: 0}),
    ]);
    
    const result = cli._filesCount();
    const expected = 1;
    
    stopAll();
    
    t.equal(result, expected, 'should process 1 file');
    t.end();
});

test('supertape: cli: successs', async (t) => {
    const name = join(__dirname, 'fixture/cli-success.js');
    const argv = [name, name, '-f', 'tap'];
    
    const supertape = reRequire('./supertape');
    const exit = stub();
    
    supertape.init({
        quiet: true,
    });
    
    await runCli({
        argv,
        exit,
    });
    
    stopAll();
    
    t.calledWith(exit, [OK], 'should call exit with 0');
    t.end();
});

test('supertape: cli: fail', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [name, name];
    
    const init = stub();
    const exit = stub();
    
    const test = stub();
    const emitter = new EventEmitter();
    const run = stub().returns(emitter);
    
    assign(test, {
        init,
        createStream,
        run,
    });
    
    mockRequire('..', test);
    
    const emit = emitter.emit.bind(emitter);
    await Promise.all([
        runCli({
            argv,
            exit,
        }),
        wait(emit, 'end', {
            failed: 1,
        }),
    ]);
    
    stopAll();
    
    t.calledWith(exit, [1], 'should call exit with 1');
    t.end();
});

test('supertape: cli: --help', async (t) => {
    const write = stub();
    const stdout = {
        write,
    };
    
    const helpPath = join(__dirname, 'fixture', 'help');
    const helpFixture = await readFile(helpPath, 'utf8');
    
    await runCli({
        argv: ['--help'],
        stdout,
    });
    
    t.calledWith(write, [helpFixture]);
    t.end();
});

test('supertape: cli: -h', async (t) => {
    const write = stub();
    const stdout = {
        write,
    };
    
    const helpPath = join(__dirname, 'fixture', 'help');
    const helpFixture = await readFile(helpPath, 'utf8');
    
    await runCli({
        argv: ['-h'],
        stdout,
    });
    
    t.calledWith(write, [helpFixture]);
    t.end();
});

test('supertape: bin: cli: format: apply last', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [
        name,
        '-f',
        'tap',
        '-f',
        'fail',
    ];
    
    const test = stub();
    const init = stub();
    const run = stub();
    const isStop = stub();
    
    const {createStream} = reRequire('..');
    mockRequire('@putout/keypress', stub().returns({
        isStop,
    }));
    
    assign(test, {
        init,
        run,
        createStream,
    });
    
    mockRequire('..', test);
    
    await runCli({
        argv,
    });
    
    stopAll();
    const expected = [{
        format: 'fail',
        quiet: true,
        run: false,
        isStop,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: cli: isStop', async (t) => {
    const name = join(__dirname, 'fixture/cli.js');
    const argv = [
        name,
        '-f',
        'json-lines',
    ];
    
    const exit = stub();
    const isStop = stub().returns(true);
    
    mockRequire('@putout/keypress', stub().returns({
        isStop,
    }));
    
    reRequire('./supertape.js');
    
    await runCli({
        exit,
        argv,
    });
    
    stopAll();
    
    t.calledWith(exit, [WAS_STOP]);
    t.end();
});

function createStream() {
    return new Transform({
        transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
        },
    });
}

async function runCli(options) {
    const {
        argv = [],
        stdout = createStream(),
        stderr = createStream(),
        cwd = __dirname,
        exit = stub(),
    } = options;
    
    const cli = reRequire('./cli');
    
    const [error] = await tryToCatch(cli, {
        argv,
        stdout,
        stderr,
        cwd,
        exit,
    });
    
    return [error, cli];
}

