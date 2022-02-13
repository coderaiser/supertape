'use strict';

const {once} = require('events');

const montag = require('montag');
const {reRequire} = require('mock-require');
const pullout = require('pullout');

const test = require('supertape');

const pull = async (stream, i = 9) => {
    const output = await pullout(stream);
    
    return output.split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: format: short', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'format: success';
    
    const tapFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const tapMessage = 'format: short';
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'short',
    });
    
    supertape(successMessage, successFn);
    supertape(tapMessage, tapFn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 11),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # format: success
        ok 1 should be truthy
        # format: short
        not ok 2 should be truthy
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

test('supertape: format: short: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    
    process.env.SUPERTAPE_NO_PROGRESS_BAR = 1;
    
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'short',
    });
    
    supertape.skip(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 8),
        once(supertape.run(), 'end'),
    ]);
    
    delete process.env.SUPERTAPE_NO_PROGRESS_BAR;
    
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

test('supertape: format: short: comment', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'format: success';
    
    const tapFn = (t) => {
        t.comment('hello');
        t.ok(false);
        t.end();
    };
    
    const tapMessage = 'format: short';
    
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'short',
    });
    
    supertape(successMessage, successFn);
    supertape(tapMessage, tapFn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 12),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # format: success
        ok 1 should be truthy
        # format: short
        # hello
        not ok 2 should be truthy
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

test('supertape: formatter: short: output', async (t) => {
    const fn = (t) => {
        t.equal('hello', 'world');
        t.end();
    };
    
    const message = 'hello world';
    
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'short',
    });
    
    await supertape(message, fn);
    
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

test('supertape: format: short: no stack trace', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'format: success';
    
    const tapFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const tapMessage = 'format: short';
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'short',
    });
    
    supertape(successMessage, successFn);
    supertape(tapMessage, tapFn);
    
    const [output] = await Promise.all([
        pull(supertape.createStream(), 18),
        once(supertape.run(), 'end'),
    ]);
    
    const result = output.replace(/at .+\n/, 'at xxx\n');
    
    const expected = montag`
        TAP version 13
        # format: success
        ok 1 should be truthy
        # format: short
        not ok 2 should be truthy
          ---
            operator: ok
            expected: |-
              true
            actual: |-
              false
            at xxx
          ...
        
        1..2
        # tests 2
        # pass 1
        # fail 1
    `;
    
    t.equal(result, expected);
    t.end();
});
