'use strict';

const {once} = require('events');

const test = require('..');
const stub = require('@cloudcmd/stub');
const wait = require('@iocmd/wait');
const montag = require('montag');
const {reRequire} = require('mock-require');
const pullout = require('pullout');

const {createOutput} = test;

test('supertape: equal', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello';
    const tests = [{
        message,
        fn,
    }];
    
    const emit = stub();
    const out = createOutput({emit});
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {
        out,
    });
    const result = out();
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: deepEqual', async (t) => {
    const fn = (t) => {
        const a = {
            hello: 'world',
        };
        const b = {
            hello: 'world',
        };
        
        t.deepEqual(a, b, 'hello message');
        t.end();
    };
    
    const message = 'hello';
    const tests = [{
        message,
        fn,
    }];
    
    const runTests = reRequire('./run-tests');
    const {createOutput} = reRequire('..');
    
    const emit = stub();
    const out = createOutput({emit});
    
    await runTests(tests, {out});
    const result = out();
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 hello message
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await once(emitter, 'result');
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should be truthy
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: createEmitter', async (t) => {
    const fn = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello';
    const {createEmitter} = reRequire('..');
    const emitter = createEmitter();
    const emit = emitter.emit.bind(emitter);
    
    emit('test', message, fn);
    emit('run');
    
    const [result] = await once(emitter, 'result');
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should be falsy
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: createStream', async (t) => {
    const fn = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello';
    const {createEmitter, createStream} = reRequire('..');
    
    const emitter = createEmitter();
    const stream = createStream(emitter);
    
    const emit = emitter.emit.bind(emitter);
    emit('test', message, fn);
    
    const [output] = await Promise.all([
        pullout(stream, 'string'),
        wait(emit, 'run'),
    ]);
    
    const result = output.slice(0, -1);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should be falsy
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape.skip(message, fn, {
        quiet: true,
    });
    
    const [result] = await once(emitter, 'result');
    
    t.notOk(result);
    t.end();
});

test('supertape: only', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message1 = 'world';
    const message2 = 'hello';
    
    reRequire('./run-tests');
    const supertape = reRequire('..');
    
    const emitter = supertape.only(message1, fn1, {
        quiet: true,
    });
    
    supertape(message2, fn2, {
        quiet: true,
    });
    
    const [result] = await once(emitter, 'result');
    
    const expected = montag`
        TAP version 13
        # world
        ok 1 should be truthy
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: extensions', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape(message, fn, {
        quiet: true,
        extensions,
    });
    
    const [result] = await once(emitter, 'result');
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: extensions: extend', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const [result] = await once(emitter, 'result');
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    
    `;
    
    t.equal(expected, result);
    t.end();
});

