import process from 'node:process';
import montag from 'montag';
import pullout from 'pullout';
import {test, createTest} from 'supertape';
import * as tapFormatter from './tap.js';

const pull = async (stream, i = 9) => {
    const output = await pullout(await stream);
    
    return output
        .split('\n')
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
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        formatter: tapFormatter,
    });
    
    test(successMessage, successFn);
    test(tapMessage, tapFn);
    
    const [result] = await Promise.all([
        pull(stream, 11),
        run(),
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
    const {
        test,
        stream,
        run,
    } = await createTest({
        formatter: tapFormatter,
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
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
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        formatter: tapFormatter,
    });
    
    test(successMessage, successFn);
    test(tapMessage, tapFn);
    
    const [result] = await Promise.all([
        pull(stream, 12),
        run(),
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
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        formatter: tapFormatter,
    });
    
    test(message, fn);
    
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
