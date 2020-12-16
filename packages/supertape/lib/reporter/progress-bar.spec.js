'use strict';

const {once} = require('events');

const montag = require('montag');
const {reRequire} = require('mock-require');
const pullout = require('pullout');

const test = require('../..');

const {env} = process;

const pull = async (stream, i = 9) => {
    const output = await pullout(stream);
    const SLASH_R = 1;
    
    return output
        .slice(SLASH_R)
        .split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: format: progress bar', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'success';
    
    const failFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const failMessage = 'fail';
    
    process.env.SUPERTAPE_NO_PROGRESS_BAR = 1;
    
    reRequire('./progress-bar');
    const supertape = reRequire('../..');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(successMessage, successFn);
    supertape(failMessage, failFn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 10),
        once(supertape.run(), 'end'),
    ]);
    
    delete process.env.SUPERTAPE_NO_PROGRESS_BAR;
    
    const expected = montag`
        TAP version 13
        
        # fail
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

test('supertape: format: progress bar: diff', async (t) => {
    const fn = (t) => {
        t.equal(1, 2);
        t.end();
    };
    
    const message = 'progress bar';
    
    process.env.SUPERTAPE_NO_PROGRESS_BAR = 1;
    
    reRequire('./progress-bar');
    const supertape = reRequire('../..');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    delete process.env.SUPERTAPE_NO_PROGRESS_BAR;
    
    const expected = montag`
        TAP version 13
        
        # progress bar
        not ok 1 should equal
          ---
            operator: equal
              diff: |-
              [32m- 2[39m
              [31m+ 1[39m
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: success', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    
    process.env.SUPERTAPE_NO_PROGRESS_BAR = 1;
    
    reRequire('./progress-bar');
    const supertape = reRequire('../..');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 8),
        once(supertape.run(), 'end'),
    ]);
    
    delete process.env.SUPERTAPE_NO_PROGRESS_BAR;
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # pass 1
      
      # ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: color', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    
    const {SUPERTAPE_PROGRESS_BAR_COLOR} = env;
    env.SUPERTAPE_PROGRESS_BAR_COLOR = 'red';
    
    reRequire('./progress-bar');
    const supertape = reRequire('../..');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 8),
        once(supertape.run(), 'end'),
    ]);
    
    env.SUPERTAPE_PROGRESS_BAR_COLOR = SUPERTAPE_PROGRESS_BAR_COLOR;
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # pass 1
      
      # ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});
