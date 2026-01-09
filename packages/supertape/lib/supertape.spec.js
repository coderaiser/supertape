'use strict';

const {once} = require('node:events');

const montag = require('montag');
const {reRequire} = require('mock-require');
const pullout = require('pullout');

const {
    test,
    stub,
    createTest,
} = require('./supertape.js');

const pull = async (stream, end = -2) => {
    const output = await pullout(await stream);
    return output.slice(0, end);
};

test('supertape: equal', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: world';
    
    const {
        test,
        run,
        stream,
    } = await createTest();
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: stack trace', async (t) => {
    const fn = (t) => {
        t.equal(1, 2);
        t.end();
    };
    
    const message = 'hello';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, -3),
        run(),
    ]);
    
    const lines = result.split('\n');
    const AT = 8;
    const CURRENT = 13;
    
    const at = lines[AT].trim();
    const current = lines[CURRENT].trim();
    
    t.equal(at, current);
    t.end();
});

test('supertape: stack strace: exception', async (t) => {
    const fn = () => {
        throw Error('hello');
    };
    
    const message = 'hello';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, (t) => {
        fn();
        t.end();
    });
    
    const [output] = await Promise.all([
        pull(stream, -3),
        run(),
    ]);
    
    const lines = output.split('\n');
    const AT = 5;
    const CURRENT = 8;
    
    const at = lines[AT].trim();
    const current = lines[CURRENT].trim();
    const [, lineAt] = at.split(':');
    const [, lineCurrent] = current.split(':');
    
    const result = Number(lineAt);
    const expected = Number(lineCurrent) + 15;
    
    t.equal(result, expected, 'line numbers should equal');
    t.end();
});

test('supertape: checkDuplicates: override', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: world';
    const {
        test,
        stream,
        run,
    } = await createTest({
        checkDuplicates: true,
    });
    
    test(message, fn, {
        checkDuplicates: false,
    });
    
    test(message, fn, {
        checkDuplicates: false,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 1 should equal
        # hello: world
        ok 2 should equal
        
        1..2
        # tests 2
        # pass 2
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: checkAssertionsCount: override', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: check';
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        checkAssertionsCount: false,
    });
    
    test(message, fn, {
        checkAssertionsCount: true,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: check
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
    
    const message = 'supertape: deepEqual';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # supertape: deepEqual
        ok 1 hello message
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: createStream', async (t) => {
    const fn = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'tape: stream';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # tape: stream
        ok 1 should be falsy
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
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
    
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
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
    
    const message1 = 'tape: only';
    const message2 = 'tape: only: 2';
    
    reRequire('./run-tests');
    const supertape = reRequire('..');
    
    const emitter = supertape.only(message1, fn1, {
        quiet: true,
    });
    
    supertape(message2, fn2, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # tape: only
        ok 1 should be truthy
        
        1..1
        # tests 1
        # pass 1
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
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
    
    const message = 'tape: ext';
    const supertape = reRequire('..');
    
    const emitter = supertape(message, fn, {
        quiet: true,
        extensions,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # tape: ext
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend', async (t) => {
    const extensions = {
        transformCode: (t) => async (a, b) => {
            return await t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'tape: extend';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # tape: extend
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: no return', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'extend: no return';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const expected = montag`
        TAP version 13
        # extend: no return
        not ok 1 ☝️ Looks like operator returns nothing, it will always fail
    `;
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), expected.length),
        once(emitter, 'end'),
    ]);
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: return function', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => () => {
            t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'return: fn';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const expected = montag`
        TAP version 13
        # return: fn
        not ok 1 ☝️ Looks like operator returns function, it will always f
    `;
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), expected.length),
        once(emitter, 'end'),
    ]);
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: async', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = async (t) => {
        await t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'extend: async';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # extend: async
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: only', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'supertape: extend: only';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape.only(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # supertape: extend: only
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: skip', async (t) => {
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
    
    const emitter = extendedTape.skip(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: test', async (t) => {
    const extensions = {
        transformCode: (t) => async (a, b) => {
            return await t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'tape: extend';
    const supertape = reRequire('..');
    
    const {test: extendedTape} = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # tape: extend
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: stub', async (t) => {
    const extensions = {
        transformCode: (t) => async (a, b) => {
            return await t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'tape: extend';
    const supertape = reRequire('..');
    
    const {stub: _stub, test: extendedTape} = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    t.equal(_stub, stub);
    t.end();
});

test('supertape: quiet: false', async (t) => {
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const {
        test,
        stream,
        run,
    } = await createTest({
        quiet: false,
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: destructuring test', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: destructuring';
    
    const supertape = reRequire('..');
    
    supertape.init({
        run: false,
        quiet: true,
    });
    
    supertape.test(message, fn);
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: destructuring
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: destructuring test: only', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message1 = 'world: only';
    const message2 = 'hello: only';
    
    reRequire('./run-tests');
    const supertape = reRequire('..');
    
    const emitter = supertape.test.only(message1, fn1, {
        quiet: true,
    });
    
    supertape.test(message2, fn2, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # world: only
        ok 1 should be truthy
        
        1..1
        # tests 1
        # pass 1
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: destructuring test: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape.test.skip(message, fn, {
        quiet: true,
    });
    
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: duplicate', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    supertape.init({
        run: false,
        quiet: true,
        checkIfEnded: false,
    });
    
    supertape(message, fn);
    supertape(message, fn);
    
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream, 62),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should equal
        not ok 2 Duplicate at
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: createTest', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: world';
    
    const {createTest} = reRequire('..');
    const {
        test,
        stream,
        run,
    } = await createTest({
        run: false,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: createTest: operator returns', async (t) => {
    let result;
    
    const fn = (t) => {
        result = t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: world';
    
    const {createTest} = reRequire('..');
    const {
        test,
        stream,
        run,
    } = await createTest({
        run: false,
    });
    
    test(message, fn);
    
    await Promise.all([
        pull(stream),
        run(),
    ]);
    
    t.equal(result.message, 'should equal');
    t.end();
});

test('supertape: createTest: formatter', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello: world';
    
    const {createTest} = reRequire('..');
    const {
        test,
        run,
        stream,
    } = await createTest({
        run: false,
        formatter: await import('@supertape/formatter-json-lines'),
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        {"count":1,"total":1,"failed":0,"test":"hello: world"}
        {"count":1,"passed":1,"failed":0,"skipped":0
    `;
    
    t.equal(result, expected);
    t.end();
});
