import montag from 'montag';
import chalk from 'chalk';
import pullout from 'pullout';
import {
    test,
    stub,
    createTest,
} from 'supertape';
import process from 'node:process';
import * as time from './time.js';

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

test('supertape: format: time', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'time: success';
    
    const failFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const failMessage = 'time: fail';
    
    const {CI} = env;
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(successMessage, successFn);
    test(failMessage, failFn);
    
    const [result] = await Promise.all([
        pull(stream, 10),
        run(),
    ]);
    
    env.CI = CI;
    
    const expected = montag`
        TAP version 13
        
        # time: fail
        ❌ not ok 2 should be truthy
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

test('supertape: format: time: diff', async (t) => {
    const fn = (t) => {
        t.equal(1, 2);
        t.end();
    };
    
    const message = 'time';
    
    const {CI} = env;
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 9),
        run(),
    ]);
    
    env.CI = CI;
    
    const expected = montag`
        TAP version 13
        
        # time
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

test('supertape: format: time: success', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'time: success';
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    env.CI = 1;
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # pass 1
      
      # ✅ ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: time: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'skip: success';
    
    const {CI} = env;
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    env.CI = CI;
    
    const expected = montag`
      TAP version 13
      
      1..0
      # tests 0
      # pass 0
      # ⚠️  skip 1
      
      # ✅ ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: time: color', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'progress-bar: color';
    const {SUPERTAPE_TIME_COLOR} = env;
    
    updateEnv({
        SUPERTAPE_TIME_COLOR: 'red',
    });
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    updateEnv({
        SUPERTAPE_TIME_COLOR,
    });
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # pass 1
      
      # ✅ ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: time: color: hash', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'progress-bar: color';
    const {SUPERTAPE_TIME_COLOR} = env;
    
    updateEnv({
        SUPERTAPE_TIME_COLOR: 'undefined',
    });
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    updateEnv({
        SUPERTAPE_TIME_COLOR,
    });
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # pass 1
      
      # ✅ ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: time: getStream: no SUPERTAPE_TIME', (t) => {
    const {SUPERTAPE_TIME} = env;
    
    const {_isCI} = global;
    
    global._isCI = 1;
    
    updateEnv({
        SUPERTAPE_TIME: '0',
    });
    
    const stream = time._getStream({
        total: 1,
    });
    
    updateEnv({
        SUPERTAPE_TIME,
    });
    
    global._isCI = _isCI;
    
    t.notEqual(stream, process.stderr);
    t.end();
});

test('supertape: format: time: getStream: SUPERTAPE_TIME', (t) => {
    const {SUPERTAPE_TIME} = env;
    
    const {_isCI} = global;
    
    global._isCI = false;
    
    updateEnv({
        SUPERTAPE_TIME: '1',
    });
    
    const stream = time._getStream({
        total: 100,
    });
    
    updateEnv({
        SUPERTAPE_TIME,
    });
    
    global._isCI = _isCI;
    
    t.equal(stream, process.stderr);
    t.end();
});

test('supertape: format: time: getStream: SUPERTAPE_TIME, no CI', (t) => {
    const {CI, SUPERTAPE_TIME} = env;
    
    updateEnv({
        SUPERTAPE_TIME: '1',
    });
    
    delete global._isCI;
    
    const stream = time._getStream();
    
    updateEnv({
        SUPERTAPE_TIME,
    });
    
    global._isCI = CI;
    
    t.equal(stream, process.stderr);
    t.end();
});

test('supertape: format: time: testEnd', (t) => {
    const increment = stub();
    const SingleBar = stub().returns({
        start: stub(),
        stop: stub(),
        increment,
    });
    
    const bar = SingleBar();
    
    const count = 1;
    const total = 10;
    const failed = 0;
    const test = 'hi';
    
    const {testEnd} = time.createFormatter(bar);
    
    testEnd({
        count,
        total,
        failed,
        test,
    });
    
    const expected = [{
        count,
        total,
        failed: '👌',
        test,
        time: '',
    }];
    
    t.calledWith(increment, expected);
    t.end();
});

test('supertape: format: time: no stack', async (t) => {
    const fn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const message = 'progress-bar: success';
    const {CI} = env;
    
    updateEnv({
        SUPERTAPE_TIME_STACK: '0',
    });
    
    global._isCI = true;
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: time,
    });
    
    test(message, fn);
    
    const [output] = await Promise.all([
        pull(stream, 19),
        run(),
    ]);
    
    const result = output.replace(/at .+\n/, 'at  xxx\n');
    
    delete env.SUPERTAPE_TIME_STACK;
    env.CI = CI;
    
    const expected = montag`
      TAP version 13
      
      # progress-bar: success
      ❌ not ok 1 should be truthy
        ---
          operator: ok
          expected: |-
            true
          result: |-
            false
          at  xxx
        ...
      
      
      1..1
      # tests 1
      # pass 0
      
      # ❌ fail 1
    `;
    
    t.equal(result, expected);
    t.end();
});

test('formatter: time: maybeZero: no', (t) => {
    const result = time.maybeZero(60);
    const expected = '';
    
    t.equal(result, expected);
    t.end();
});

test('formatter: time: maybeZero: yes', (t) => {
    const result = time.maybeZero(5);
    const expected = '0';
    
    t.equal(result, expected);
    t.end();
});

test('formatter: time: getColorFn', (t) => {
    const result = time.getColorFn('red');
    
    t.equal(result, chalk.red);
    t.end();
});

function updateEnv(env) {
    for (const [name, value] of Object.entries(env)) {
        if (value === 'undefined')
            delete process.env[name];
        else
            process.env[name] = value;
    }
}
