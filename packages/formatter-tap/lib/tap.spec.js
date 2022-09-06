import {once} from 'events';

import montag from 'montag';
import {reRequire} from 'mock-require';
import pullout from 'pullout';

import test from 'supertape';

const pull = async (stream, i = 9) => {
    const output = await pullout(await stream);
    
    return output.split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: format: tap', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'format: success';
    
    const tapFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const tapMessage = 'format: tap';
    
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'tap',
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
        # format: tap
        not ok 2 should be truthy
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

test('supertape: format: tap: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    
    process.env.SUPERTAPE_NO_PROGRESS_BAR = 1;
    
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'tap',
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

test('supertape: format: tap: comment', async (t) => {
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
    
    const tapMessage = 'format: tap';
    
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'tap',
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
        # format: tap
        # hello
        not ok 2 should be truthy
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

test('supertape: formatter: tap: output', async (t) => {
    const fn = (t) => {
        t.equal('hello', 'world');
        t.end();
    };
    
    const message = 'hello world';
    
    const supertape = reRequire('supertape');
    await supertape(message, fn, {
        quiet: true,
        format: 'tap',
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

