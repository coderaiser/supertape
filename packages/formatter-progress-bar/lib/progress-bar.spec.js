'use strict';

const {once} = require('events');

const montag = require('montag');
const mockRequire = require('mock-require');
const {reRequire, stopAll} = mockRequire;
const pullout = require('pullout');

const {test, stub} = require('supertape');

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
    
    const {CI} = env;
    env.CI = 1;
    
    reRequire('ci-info');
    reRequire('./progress-bar');
    const supertape = reRequire('supertape');
    
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
    
    env.CI = CI;
    
    const expected = montag`
        TAP version 13
        
        # fail
        ❌ not ok 2 should be truthy
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
    
    const {CI} = env;
    env.CI = 1;
    
    reRequire('ci-info');
    reRequire('./progress-bar');
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
    env.CI = CI;
    
    const expected = montag`
        TAP version 13
        
        # progress bar
        ❌ not ok 1 should equal
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
    
    env.CI = 1;
    
    reRequire('ci-info');
    reRequire('./progress-bar');
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 8),
        once(supertape.run(), 'end'),
    ]);
    
    env.CI = 1;
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # ✅ pass 1
      
      # ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    
    const {CI} = env;
    env.CI = 1;
    
    reRequire('ci-info');
    reRequire('./progress-bar');
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape.skip(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 8),
        once(supertape.run(), 'end'),
    ]);
    
    env.CI = CI;
    
    const expected = montag`
      TAP version 13
      
      1..0
      # tests 0
      # ✅ pass 0
      # ⚠️  skip 1
      
      # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: color', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    const {CI} = env;
    
    env.CI = 1;
    env.SUPERTAPE_PROGRESS_BAR_COLOR = 'red';
    
    reRequire('ci-info');
    reRequire('./progress-bar');
    const supertape = reRequire('supertape');
    
    supertape.init({
        quiet: true,
        format: 'progress-bar',
    });
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream(), 8),
        once(supertape.run(), 'end'),
    ]);
    
    delete env.SUPERTAPE_PROGRESS_BAR_COLOR;
    env.CI = CI;
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # ✅ pass 1
      
      # ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: getStream: no SUPERTAPE_PROGRESS_BAR', (t) => {
    const {
        CI,
        SUPERTAPE_PROGRESS_BAR,
    } = env;
    delete env.SUPERTAPE_PROGRESS_BAR;
    env.CI = 1;
    
    reRequire('ci-info');
    const {_getStream} = reRequire('./progress-bar');
    const stream = _getStream();
    
    env.CI = CI;
    env.SUPERTAPE_PROGRESS_BAR = SUPERTAPE_PROGRESS_BAR;
    
    t.notEqual(stream, process.stderr);
    t.end();
});

test('supertape: format: progress bar: getStream: SUPERTAPE_PROGRESS_BAR', (t) => {
    const {
        CI,
        SUPERTAPE_PROGRESS_BAR,
    } = env;
    env.SUPERTAPE_PROGRESS_BAR = 1;
    env.CI = 1;
    
    reRequire('ci-info');
    const {_getStream} = reRequire('./progress-bar');
    const stream = _getStream();
    
    env.CI = CI;
    env.SUPERTAPE_PROGRESS_BAR = SUPERTAPE_PROGRESS_BAR;
    
    t.equal(stream, process.stderr);
    t.end();
});

test('supertape: format: progress bar: getStream: SUPERTAPE_PROGRESS_BAR, no CI', (t) => {
    const {
        CI,
        SUPERTAPE_PROGRESS_BAR,
    } = env;
    env.SUPERTAPE_PROGRESS_BAR = 1;
    delete env.CI;
    
    reRequire('ci-info');
    const {_getStream} = reRequire('./progress-bar');
    const stream = _getStream();
    
    env.CI = CI;
    env.SUPERTAPE_PROGRESS_BAR = SUPERTAPE_PROGRESS_BAR;
    
    t.equal(stream, process.stderr);
    t.end();
});

test('supertape: format: progress bar: testEnd', (t) => {
    const increment = stub();
    const SingleBar = stub().returns({
        start: stub(),
        increment,
    });
    
    mockRequire('cli-progress', {
        SingleBar,
        Presets: {
            React: {},
        },
    });
    
    reRequire('once');
    const {start, testEnd} = reRequire('./progress-bar');
    start({total: 10});
    
    const count = 1;
    const total = 10;
    const failed = 0;
    const message = 'hi';
    
    testEnd({
        count,
        total,
        failed,
        message,
    });
    
    stopAll();
    
    const expected = [{
        count,
        total,
        failed: '👌',
        message,
    }];
    
    t.calledWith(increment, expected);
    t.end();
});
