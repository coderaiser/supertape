'use strict';

const montag = require('montag');
const {reRequire} = require('mock-require');

const test = require('..');

const {createOutput} = test;

const cutStackTrace = (a, i = 9) => a
    .split('\n')
    .slice(0, i)
    .join('\n');

test('supertape: runTests', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const result = cutStackTrace(out());
    
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
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: fail', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.fail('hello');
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const result = cutStackTrace(out(), 5);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 hello
          ---
            operator: fail
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: equal', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.equal('hello', 'hello');
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const result = out();
    
    const expected = montag`
        TAP version 13
        # hello world
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: not equal', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.equal('hello', 'world');
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const BEFORE_DIFF = 6;
    const result = cutStackTrace(out(), BEFORE_DIFF);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 should equal
          ---
            operator: equal
              diff: |-
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: not deepEqual', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.deepEqual('hello', 'world');
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const BEFORE_DIFF = 6;
    const result = cutStackTrace(out(), BEFORE_DIFF);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 should equal
          ---
            operator: deepEqual
              diff: |-
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: jsonEqual', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.jsonEqual({a: 1}, {a: 1});
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const result = cutStackTrace(out());
    
    const expected = montag`
        TAP version 13
        # hello world
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: comment', async (t) => {
    const out = createOutput();
    const fn = (t) => {
        t.comment('hello');
        t.end();
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const result = cutStackTrace(out());
    
    const expected = montag`
        TAP version 13
        # hello world
        # hello
        
        1..0
        # tests 0
        # pass 0
    
    `;
    
    t.equal(expected, result);
    t.end();
});

test('supertape: runTests: crash', async (t) => {
    const out = createOutput();
    const fn = () => {
        throw Error('x');
    };
    
    const message = 'hello world';
    const tests = [{
        fn,
        message,
    }];
    
    const runTests = reRequire('./run-tests');
    await runTests(tests, {out});
    
    const result = cutStackTrace(out(), 3);
    
    const expected = montag`
        TAP version 13
        # hello world
        not ok 1 Error: x
    `;
    
    t.equal(expected, result);
    t.end();
});
