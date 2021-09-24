'use strict';

const {once, EventEmitter} = require('events');

const montag = require('montag');
const mockRequire = require('mock-require');
const pullout = require('pullout');

const {reRequire, stopAll} = mockRequire;

const {test, stub} = require('..');

const pull = async (stream, i = 9) => {
    const output = await pullout(stream);
    
    return output.split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: runTests', async (t) => {
    const fn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 should be truthy
          ---
            operator: ok
            expected: |-
              true
            actual: |-
              false
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: runTests: duplicates: node_modules', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello world';
    
    const StackTracey = stub().returns([{
        beforeParse: 'at getDuplicatesMessage (/node_modules/supertape/lib/supertape.js:113:37)',
        file: '/node_modules/supertape/lib/supertape.js',
    },
    {
        beforeParse: 'at test (/node_modules/supertape/lib/supertape.js:144:31)',
        file: '/node_modules/supertape/lib/supertape.js',
    }, {
        beforeParse: 'at only (/node_modules/supertape/lib/supertape.js:144:31)',
        file: '/node_modules/supertape/lib/supertape.js',
    },
    {
        beforeParse: 'at Object.<anonymous> (/Users/coderaiser/putout/packages/traverse/lib/traverse.spec.js:123:1)',
        file: '/Users/coderaiser/putout/packages/traverse/lib/traverse.spec.js',
    }]);
    
    mockRequire('stacktracey', StackTracey);
    
    const messages = new Set();
    const supertape = reRequire('..');
    supertape(message, fn1, {
        quiet: true,
        checkDuplicates: true,
        messages,
    });
    
    supertape(message, fn2, {
        quiet: true,
        checkDuplicates: true,
        messages,
    });
    
    const FOUR_TESTS = 30;
    const [result] = await Promise.all([
        pull(supertape.createStream(), FOUR_TESTS),
        once(supertape.run(), 'end'),
    ]);
    
    stopAll();
    
    t.notMatch(result, 'node_modules');
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
    
    reRequire('./validator');
    const supertape = reRequire('..');
    supertape(message, fn1, {
        quiet: true,
        checkDuplicates: true,
    });
    
    supertape(message, fn2, {
        quiet: true,
        checkDuplicates: true,
    });
    
    const FOUR_TESTS = 30;
    const [result] = await Promise.all([
        pull(supertape.createStream(), FOUR_TESTS),
        once(supertape.run(), 'end'),
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
    
    const message = 'hello world';
    
    reRequire('./validator');
    const supertape = reRequire('..');
    supertape(message, fn1, {
        quiet: true,
        checkDuplicates: false,
    });
    
    supertape(message, fn2, {
        quiet: true,
        checkDuplicates: false,
    });
    
    const FOUR_TESTS = 30;
    const [result] = await Promise.all([
        pull(supertape.createStream(), FOUR_TESTS),
        once(supertape.run(), 'end'),
    ]);
    
    t.notMatch(result, 'not ok 2 Duplicate');
    t.end();
});

test('supertape: runTests: duplicates: defaults', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello world';
    
    reRequire('./validator');
    const supertape = reRequire('..');
    supertape(message, fn1, {
        quiet: true,
    });
    
    supertape(message, fn2, {
        quiet: true,
    });
    
    const FOUR_TESTS = 30;
    const [result] = await Promise.all([
        pull(supertape.createStream(), FOUR_TESTS),
        once(supertape.run(), 'end'),
    ]);
    
    t.match(result, 'not ok 2 Duplicate');
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
    
    const supertape = reRequire('..');
    supertape(message, fn1, {
        quiet: true,
        checkDuplicates: true,
    });
    
    supertape(message, fn2, {
        quiet: true,
        checkDuplicates: true,
    });
    
    const FOUR_TESTS = 30;
    const [result] = await Promise.all([
        pull(supertape.createStream(), FOUR_TESTS),
        once(supertape.run(), 'end'),
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
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
        checkDuplicates: true,
    });
    
    supertape('something else', fn, {
        quiet: true,
        checkDuplicates: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
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
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 5),
        once(supertape.run(), 'end'),
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

test('supertape: runTests: assertions after t.end()', async (t) => {
    const fn = (t) => {
        t.end();
        t.fail('hello');
    };
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 5),
        once(supertape.run(), 'end'),
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
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 6),
        once(supertape.run(), 'end'),
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

test('supertape: runTests: fail: timeout', async (t) => {
    const fn = async (t) => {
        await once(new EventEmitter(), 'end');
        t.end();
    };
    
    const message = 'hello world';
    
    const {SUPERTAPE_TIMEOUT} = process.env;
    process.env.SUPERTAPE_TIMEOUT = 1;
    
    reRequire('./run-tests');
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 5),
        once(supertape.run(), 'end'),
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

test('supertape: runTests: equal', async (t) => {
    const fn = (t) => {
        t.equal('hello', 'hello');
        t.end();
    };
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
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
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const BEFORE_DIFF = 6;
    const [result] = await Promise.all([
        pull(supertape.createStream(), BEFORE_DIFF),
        once(supertape.run(), 'end'),
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
        t.deepEqual('hello', 'world');
        t.end();
    };
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const BEFORE_DIFF = 6;
    const [result] = await Promise.all([
        pull(supertape.createStream(), BEFORE_DIFF),
        once(supertape.run(), 'end'),
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
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
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
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 3),
        once(supertape.run(), 'end'),
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
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
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
    
    const message = 'hello world';
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
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
    
    const message1 = 'hello world';
    const message2 = 'bye world';
    const isStop = stub().returns(true);
    
    const supertape = reRequire('..');
    supertape(message1, fn1, {
        quiet: true,
        isStop,
    });
    
    supertape(message2, fn2);
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello world
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
    
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 6),
        once(supertape.run(), 'end'),
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
    
    const message = 'hello world';
    
    mockRequire('./is-debug', true);
    reRequire('./run-tests');
    const supertape = reRequire('..');
    supertape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    stopAll();
    
    const expected = montag`
        TAP version 13
        # hello world
        ok 1 (unnamed assert)
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});
