import {fileURLToPath} from 'node:url';
import process from 'node:process';
import {join, dirname} from 'node:path';
import {Transform} from 'node:stream';
import {EventEmitter} from 'node:events';
import {readFile} from 'node:fs/promises';
import {stub} from '@cloudcmd/stub';
import {tryToCatch} from 'try-to-catch';
import pullout from 'pullout';
import wait from '@iocmd/wait';
import test, {
    createTest,
    createStream as _createStream,
} from './supertape.js';
import cli, {_filesCount} from './cli.js';
import {
    OK,
    WAS_STOP,
    SKIPPED,
    UNHANDLED,
} from './exit-codes.js';
import {enableOnce, disableOnce} from './maybe-once.js';
import info from '../package.json' with {
    type: 'json',
};

const {version} = info;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const {assign} = Object;

test('supertape: cli: -r', async (t) => {
    const argv = [
        '-r',
        'hello',
    ];
    
    const write = stub();
    const stderr = {
        write,
    };
    
    await runCli({
        argv,
        stderr,
    });
    
    const [[message]] = write.args;
    
    t.match(message, `Cannot find package 'hello'`);
    t.end();
});

test('supertape: cli: -v', async (t) => {
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
    const globSync = stub().returns([]);
    
    await runCli({
        argv,
        globSync,
    });
    
    t.calledWith(globSync, ['hello']);
    t.end();
});

test('supertape: bin: cli: glob: a couple', async (t) => {
    const argv = [
        'hello',
        'world',
    ];
    
    const globSync = stub().returns([]);
    
    await runCli({
        argv,
        globSync,
    });
    
    const [[first], [second]] = globSync.args;
    
    t.deepEqual([first, second], ['hello', 'world'], 'should call glob.sync on every iteration');
    t.end();
});

test('supertape: bin: cli: run', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        name,
        '--dry-run',
    ];
    
    const supertape = stub();
    const init = stub();
    const run = stub();
    
    assign(supertape, {
        init,
        run,
        createStream: _createStream,
    });
    
    await runCli({
        argv,
        supertape,
    });
    
    t.calledOnce(run, 'run always called once');
    t.end();
});

test('supertape: bin: cli: run: not test', async (t) => {
    const name = new URL('fixture/not-test.js', import.meta.url).pathname;
    const argv = [name];
    
    const supertape = stub();
    const [error] = await runCli({
        argv,
        supertape,
    });
    
    t.notOk(error, 'should not be an error');
    t.end();
});

test('supertape: bin: cli: files count', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        name,
        '--dry-run',
    ];
    
    const emitter = new EventEmitter();
    
    const supertape = stub();
    const init = stub();
    const run = stub().returns(emitter);
    
    assign(supertape, {
        init,
        run,
        createStream,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    await Promise.all([
        runCli({
            argv,
            supertape,
        }),
        wait(emit, 'end', {
            failed: 0,
        }),
    ]);
    
    const result = _filesCount();
    const expected = 1;
    
    t.equal(result, expected, 'should process 1 file');
    t.end();
});

test('supertape: cli: success', async (t) => {
    const name = new URL('fixture/cli-success.js', import.meta.url).pathname;
    const argv = [
        name,
        name,
        '-f',
        'tap',
        '--dry-run',
    ];
    
    const exit = stub();
    const emitter = new EventEmitter();
    
    const init = stub();
    const run = stub().returns(emitter);
    
    const test = createTest({
        quiet: true,
    });
    
    assign(test, {
        init,
        run,
        createStream,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    await Promise.all([
        runCli({
            argv,
            exit,
            supertape: test,
        }),
        wait(emit, 'end', {
            failed: 0,
        }),
    ]);
    
    t.calledWith(exit, [OK], 'should call exit with 0');
    t.end();
});

test('supertape: bin: cli: node_modules', async (t) => {
    const {findUpSync} = await import('find-up');
    const name = join(dirname(findUpSync('package.json')), 'node_modules');
    const argv = [name];
    
    const emitter = new EventEmitter();
    
    const supertape = stub();
    const init = stub();
    const run = stub().returns(emitter);
    
    assign(supertape, {
        init,
        run,
        createStream,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    disableOnce();
    await Promise.all([
        runCli({
            argv,
            supertape,
        }),
        wait(emit, 'end', {
            failed: 0,
        }),
    ]);
    
    enableOnce();
    
    const result = _filesCount();
    const expected = 0;
    
    t.equal(result, expected, 'should not process node_modules');
    t.end();
});

test('supertape: cli: fail', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        name,
        '--dry-run',
    ];
    
    const init = stub();
    const exit = stub();
    
    const supertape = stub();
    const emitter = new EventEmitter();
    const run = stub().returns(emitter);
    
    assign(supertape, {
        init,
        createStream,
        run,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    await Promise.all([
        runCli({
            argv,
            exit,
            supertape,
        }),
        wait(emit, 'end', {
            failed: 1,
        }),
    ]);
    
    t.calledWith(exit, [1], 'should call exit with 1');
    t.end();
});

test('supertape: cli: exit: skipped', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        name,
        '--dry-run',
    ];
    
    const init = stub();
    const exit = stub();
    
    const supertape = stub();
    const emitter = new EventEmitter();
    const run = stub().returns(emitter);
    
    assign(supertape, {
        init,
        createStream,
        run,
    });
    
    process.env.SUPERTAPE_CHECK_SKIPPED = '1';
    disableOnce();
    
    const emit = emitter.emit.bind(emitter);
    
    await Promise.all([
        runCli({
            argv,
            exit,
            supertape,
        }),
        wait(emit, 'end', {
            skipped: 1,
        }),
    ]);
    
    delete process.env.SUPERTAPE_CHECK_SKIPPED;
    enableOnce();
    
    t.calledWith(exit, [SKIPPED], 'should call exit with SKIPPED');
    t.end();
});

test('supertape: cli: exit: skipped: disabled', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        name,
        '--dry-run',
    ];
    
    const init = stub();
    const exit = stub();
    
    const supertape = stub();
    const emitter = new EventEmitter();
    const run = stub().returns(emitter);
    
    assign(supertape, {
        init,
        createStream,
        run,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    await Promise.all([
        runCli({
            argv,
            exit,
            supertape,
        }),
        wait(emit, 'end', {
            skipped: 1,
        }),
    ]);
    
    t.calledWith(exit, [OK], 'should call exit with OK');
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

test('supertape: bin: cli: --check-duplicates', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [name, '-d', '--dry-run'];
    
    const init = stub();
    const isStop = stub();
    
    const keypress = stub().returns({
        isStop,
    });
    
    const test = createTest({
        quiet: true,
    });
    
    assign(test, {
        init,
        createStream: stub().returns(test.stream),
    });
    
    await runCli({
        argv,
        keypress,
        supertape: test,
    });
    
    const expected = [{
        format: 'progress-bar',
        quiet: true,
        run: false,
        checkDuplicates: true,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: --check-assertions-count', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [name, '-a', '--dry-run'];
    
    const init = stub();
    const isStop = stub();
    
    const keypress = stub().returns({
        isStop,
    });
    
    const test = createTest({
        quiet: true,
    });
    
    assign(test, {
        init,
        createStream: stub().returns(test.stream),
    });
    
    await runCli({
        argv,
        supertape: test,
        keypress,
    });
    
    const expected = [{
        format: 'progress-bar',
        quiet: true,
        run: false,
        checkDuplicates: true,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: SUPERTAPE_CHECK_DUPLICATES: env', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [name, '-a', '--dry-run'];
    
    const init = stub();
    const isStop = stub().returns(true);
    
    const keypress = stub().returns({
        isStop,
    });
    
    const test = createTest({
        quiet: false,
    });
    
    assign(test, {
        init,
        createStream: stub().returns(test.stream),
    });
    
    process.env.SUPERTAPE_CHECK_DUPLICATES = '0';
    await runCli({
        argv,
        keypress,
        supertape: test,
    });
    delete process.env.SUPERTAPE_CHECK_DUPLICATES;
    
    const expected = [{
        format: 'progress-bar',
        quiet: true,
        run: false,
        checkDuplicates: false,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: SUPERTAPE_ASSERTIONS_COUNT: env', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [name, '--dry-run'];
    
    const init = stub();
    const isStop = stub().returns(true);
    
    const keypress = stub().returns({
        isStop,
    });
    
    const test = createTest({
        quiet: true,
    });
    
    assign(test, {
        init,
        run: stub(),
        createStream: stub().returns(test.stream),
    });
    
    process.env.SUPERTAPE_CHECK_ASSERTIONS_COUNT = '1';
    await runCli({
        argv,
        supertape: test,
        keypress,
    });
    delete process.env.SUPERTAPE_CHECK_ASSERTIONS_COUNT;
    
    const expected = [{
        format: 'progress-bar',
        quiet: true,
        run: false,
        checkDuplicates: true,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: SUPERTAPE_CHECK_DUPLICATES: disabled with a flag, enable env', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [name, '--no-check-duplicates', '--dry-run'];
    
    const init = stub();
    const isStop = stub();
    
    const keypress = stub().returns({
        isStop,
    });
    
    disableOnce();
    const test = createTest({
        quiet: true,
    });
    
    assign(test, {
        init,
        run: stub(),
        createStream: stub().returns(test.stream),
    });
    
    process.env.SUPERTAPE_CHECK_DUPLICATES = '1';
    await runCli({
        argv,
        supertape: test,
        keypress,
        isStop: stub().returns(true),
    });
    delete process.env.SUPERTAPE_CHECK_DUPLICATES;
    
    const expected = [{
        format: 'progress-bar',
        quiet: true,
        run: false,
        checkDuplicates: false,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: check-duplicates: -d', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [name, '-d', '--dry-run'];
    
    const test = stub();
    const init = stub();
    const run = stub();
    const isStop = stub();
    
    const keypress = stub().returns({
        isStop,
    });
    
    assign(test, {
        init,
        run,
        createStream,
    });
    
    await runCli({
        argv,
        keypress,
        supertape: test,
    });
    
    const expected = [{
        format: 'progress-bar',
        quiet: true,
        run: false,
        checkDuplicates: true,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: format: apply last', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        '-f',
        'tap',
        '-f',
        'fail',
        '--dry-run',
    ];
    
    const supertape = stub();
    const init = stub();
    const run = stub();
    const isStop = stub();
    
    const keypress = stub().returns({
        isStop,
    });
    
    assign(supertape, {
        init,
        run,
        createStream: _createStream,
    });
    
    await runCli({
        argv,
        keypress,
        supertape,
    });
    
    const expected = [{
        format: 'fail',
        quiet: true,
        run: false,
        checkDuplicates: true,
        checkAssertionsCount: true,
        checkScopes: true,
        isStop,
        workerFormatter: null,
    }];
    
    t.calledWith(init, expected);
    t.end();
});

test('supertape: bin: cli: invalid file', async (t) => {
    const name = new URL('fixture/invalid.js', import.meta.url).pathname;
    const argv = [name, '--dry-run'];
    const exit = stub();
    const supertape = stub();
    
    disableOnce();
    await runCli({
        exit,
        argv,
        supertape,
    });
    enableOnce();
    
    t.calledWith(exit, [UNHANDLED]);
    t.end();
});

test('supertape: cli: isStop', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        '-f',
        'json-lines',
        '--dry-run',
    ];
    
    const exit = stub();
    const isStop = stub().returns(true);
    
    const keypress = stub().returns({
        isStop,
    });
    
    globalThis.onceDisabled = true;
    
    const emitter = new EventEmitter();
    
    const supertape = stub();
    const init = stub();
    const run = stub().returns(emitter);
    
    assign(supertape, {
        init,
        run,
        createStream: _createStream,
    });
    
    const emit = emitter.emit.bind(emitter);
    
    await Promise.all([
        runCli({
            exit,
            argv,
            keypress,
            supertape,
        }),
        wait(emit, 'end', {
            failed: 0,
        }),
    ]);
    globalThis.onceDisabled = true;
    
    t.calledWith(exit, [WAS_STOP]);
    t.end();
});

test('supertape: cli: validation', async (t) => {
    const name = new URL('fixture/cli.js', import.meta.url).pathname;
    const argv = [
        name,
        '--forma',
        'json-lines',
        '--dry-run',
    ];
    
    const write = stub();
    
    const stderr = {
        write,
    };
    
    await runCli({
        argv,
        stderr,
    });
    
    const [[message]] = write.args;
    
    t.equal(message, 'Invalid option `--forma`. Perhaps you meant `--format`\n');
    t.end();
});

const createStream = () => new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
    },
});

async function runCli(options) {
    const {
        argv = [],
        stdout = createStream(),
        stderr = createStream(),
        cwd = __dirname,
        exit = stub(),
        workerFormatter = null,
        keypress,
        supertape,
        globSync,
    } = options;
    
    const [error] = await tryToCatch(cli, {
        argv,
        stdout,
        stderr,
        cwd,
        exit,
        workerFormatter,
        keypress,
        supertape,
        globSync,
    });
    
    return [error, cli];
}
