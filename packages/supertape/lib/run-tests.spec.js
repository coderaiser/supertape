'use strict';

const process = require('node:process');
const {once, EventEmitter} = require('node:events');

const montag = require('montag');

const pullout = require('pullout');

const {parseTime} = require('./run-tests');
const {test, stub} = require('..');
const {createTest} = require('./supertape');

const pull = async (stream, i = 9) => {
    const output = await pullout(await stream);
    
    return output
        .split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: runTests', async (t) => {
    const fn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const message = 'hello world';
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
        # hello world
        not ok 1 should be truthy
          ---
            operator: ok
            expected: |-
              true
            result: |-
              false
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: duplicates', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        quiet: false,
    });
    
    test(message, fn1, {
        quiet: true,
        checkDuplicates: true,
        checkIfEnded: false,
    });
    
    test(message, fn2, {
        quiet: true,
        checkDuplicates: true,
        checkIfEnded: false,
    });
    
    const FOUR_TESTS = 30;
    
    const [result] = await Promise.all([
        pull(stream, FOUR_TESTS),
        run(),
    ]);
    
    t.match(result, 'not ok 2 Duplicate');
    t.end();
});

test('supertape: runTests: duplicates: false', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello: world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn1);
    test(message, fn2);
    
    const FOUR_TESTS = 30;
    
    const [result] = await Promise.all([
        pull(stream, FOUR_TESTS),
        run(),
    ]);
    
    t.notMatch(result, 'not ok 2 Duplicate');
    t.end();
});

test('supertape: runTests: duplicates: not match', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn1, {
        quiet: true,
        checkDuplicates: true,
    });
    
    test(message, fn2, {
        quiet: true,
        checkDuplicates: true,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    t.notMatch(result, 'not ok 4 Duplicate');
    t.end();
});

test('supertape: runTests: no duplicates', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'hello world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
        checkDuplicates: true,
    });
    
    test('something else', fn, {
        quiet: true,
        checkDuplicates: true,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    t.notMatch(result, 'Duplicate message at');
    t.end();
});

test('supertape: runTests: fail', async (t) => {
    const fn = (t) => {
        t.fail('hello');
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 hello
          ---
            operator: fail
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: checkAssertionsCount: no assertions', async (t) => {
    const fn = (t) => {
        t.end();
    };
    
    const message = 'hello: world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
        checkAssertionsCount: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        not ok 1 Only one assertion per test allowed, looks like you have none
          ---
            operator: fail
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: assertions after t.end()', async (t) => {
    const fn = (t) => {
        t.end();
        t.fail('hello');
    };
    
    const message = 'hello world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
        checkIfEnded: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 Cannot run assertions after 't.end()' called
          ---
            operator: fail
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: a couple t.end()', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
        t.end();
    };
    
    const message = 'hello world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
        checkIfEnded: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        ok 1 should equal
        not ok 2 Cannot use a couple 't.end()' operators in one test
          ---
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: assertions after t.end(): async', async (t) => {
    const fn = async (t) => {
        t.end();
        return await t.asyncOperator('hello', 'hello');
    };
    
    const message = 'hello world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    const superTest = test.extend({
        asyncOperator: (t) => async (a, b) => {
            return await t.equal(a, b, 'should transform code');
        },
    });
    
    superTest(message, fn, {
        quiet: true,
        checkIfEnded: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 Cannot run assertions after 't.end()' called
          ---
            operator: fail
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: fail: at', async (t) => {
    const fn = (t) => {
        t.fail('hello', 'at: xxxx');
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 6),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 hello
          ---
            operator: fail
            at: xxxx
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: fail: timeout: SUPERTAPE_TIMEOUT', async (t) => {
    const fn = async (t) => {
        await once(new EventEmitter(), 'end');
        t.end();
    };
    
    const message = 'hello world';
    const {SUPERTAPE_TIMEOUT} = process.env;
    
    process.env.SUPERTAPE_TIMEOUT = 1;
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 timeout
          ---
            operator: fail
    `;
    
    process.env.SUPERTAPE_TIMEOUT = SUPERTAPE_TIMEOUT;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: fail: timeout', async (t) => {
    const fn = async (t) => {
        await once(new EventEmitter(), 'end');
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
        timeout: 1,
    });
    
    const [result] = await Promise.all([
        pull(stream, 5),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 timeout
          ---
            operator: fail
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: equal', async (t) => {
    const fn = (t) => {
        t.equal('hello', 'hello');
        t.end();
    };
    
    const message = 'hello: world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
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

test('supertape: runTests: not equal', async (t) => {
    const fn = (t) => {
        t.equal('hello', 'world');
        t.end();
    };
    
    const message = 'hello world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const BEFORE_DIFF = 6;
    
    const [result] = await Promise.all([
        pull(stream, BEFORE_DIFF),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 should equal
          ---
            operator: equal
              diff: |-
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: not deepEqual', async (t) => {
    const fn = (t) => {
        t.deepEqual({hello: 'world'}, {});
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const BEFORE_DIFF = 6;
    
    const [result] = await Promise.all([
        pull(stream, BEFORE_DIFF),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 should deep equal
          ---
            operator: deepEqual
              diff: |-
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: comment', async (t) => {
    const fn = (t) => {
        t.comment('hello');
        t.end();
    };
    
    const message = 'hello: world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
        checkAssertionsCount: false,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        # hello
        
        1..0
        # tests 0
        # pass 0
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: crash', async (t) => {
    const fn = () => {
        throw Error('x');
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 3),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 Error: x
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: pass', async (t) => {
    const fn = (t) => {
        t.pass('hello');
        t.end();
    };
    
    const message = 'hello: world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 1 hello
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: pass: unnamed', async (t) => {
    const fn = (t) => {
        t.pass();
        t.end();
    };
    
    const message = 'hello: world';
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 1 (unnamed assert)
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: isStop', async (t) => {
    const fn1 = (t) => {
        t.pass();
        t.end();
    };
    
    const fn2 = (t) => {
        t.pass();
        t.end();
    };
    
    const message1 = 'hello: world';
    const message2 = 'bye: world';
    const isStop = stub().returns(true);
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        isStop,
    });
    
    test(message1, fn1, {
        quiet: true,
    });
    
    test(message2, fn2);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 2 (unnamed assert)
        
        1..2
        # tests 2
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: not equal, but deepEqual', async (t) => {
    const a = {
        hello: 'world',
    };
    
    const b = {
        hello: 'world',
    };
    
    const fn = (t) => {
        t.equal(a, b);
        t.end();
    };
    
    const message = 'hello world';
    
    const {
        test,
        stream,
        run,
    } = await createTest();
    
    test(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 6),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 should equal
          ---
            operator: equal
            result: values not equal, but deepEqual
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: is debug', async (t) => {
    const fn = (t) => {
        t.pass();
        t.end();
    };
    
    const message = 'hello: world';
    const isDebug = stub().returns(true);
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        quiet: false,
        isDebug,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello: world
        ok 1 (unnamed assert)
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: parseTimeundefined', (t) => {
    const result = parseTime('undefined');
    const expected = 1;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: parseTime', (t) => {
    const result = parseTime('1000');
    const expected = '1000';
    
    t.equal(result, expected);
    t.end();
});
