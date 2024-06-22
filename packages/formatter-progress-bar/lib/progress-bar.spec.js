import process from 'node:process';
import montag from 'montag';
import pullout from 'pullout';
import {
    test,
    stub,
    createTest,
} from 'supertape';
import * as progressBar from './progress-bar.js';

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
    
    const successMessage = 'progress bar: success';
    
    const failFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const failMessage = 'progress bar: fail';
    const {CI} = env;
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
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
        
        # progress bar: fail
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

test('supertape: format: progress bar: comment', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'progress bar: success';
    
    const failFn = (t) => {
        t.comment('second');
        t.ok(false);
        t.end();
    };
    
    const failMessage = 'progress bar: fail';
    const {CI} = env;
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(successMessage, successFn);
    test(failMessage, failFn);
    
    const [result] = await Promise.all([
        pull(stream, 11),
        run(),
    ]);
    
    env.CI = CI;
    
    const expected = montag`
        TAP version 13
        # second
        
        # progress bar: fail
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

test('supertape: format: progress bar: diff', async (t) => {
    const fn = (t) => {
        t.equal(1, 2);
        t.end();
    };
    
    const message = 'progress bar';
    
    const {CI} = env;
    
    env.CI = 1;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 9),
        run(),
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
    
    const message = 'progress bar: success';
    
    const {
        CI,
        TERMINAL_EMULATOR,
    } = env;
    
    updateEnv({
        CI: 1,
        TERMINAL_EMULATOR: 'JetBrains-JediTerm',
    });
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    updateEnv({
        CI,
        TERMINAL_EMULATOR,
    });
    
    const expected = montag`
      TAP version 13
      
      1..1
      # tests 1
      # pass 1
      
      # ✅  ok
    ` + '\n';
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'skip: success';
    
    const {
        CI,
        TERMINAL_EMULATOR,
    } = env;
    
    env.CI = 1;
    delete env.TERMINAL_EMULATOR;
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    env.CI = CI;
    
    if (TERMINAL_EMULATOR)
        env.TERMINAL_EMULATOR = TERMINAL_EMULATOR;
    
    const expected = montag`
      TAP version 13
      
      1..0
      # tests 0
      # pass 0
      # ⚠️ skip 1
      
      # ✅ ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: skip: webstorm', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'skip: success';
    const {
        CI,
        TERMINAL_EMULATOR,
    } = env;
    
    env.CI = 1;
    env.TERMINAL_EMULATOR = 'JetBrains-JediTerm';
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    env.CI = CI;
    env.TERMINAL_EMULATOR = TERMINAL_EMULATOR;
    
    const expected = montag`
      TAP version 13
      
      1..0
      # tests 0
      # pass 0
      # ⚠️ skip 1
      
      # ✅  ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: progress bar: color', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'progress-bar: color';
    
    const {
        SUPERTAPE_PROGRESS_BAR_COLOR,
        TERMINAL_EMULATOR,
    } = env;
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR_COLOR: 'red',
        TERMINAL_EMULATOR: undefined,
    });
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR_COLOR,
        TERMINAL_EMULATOR,
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

test('supertape: format: progress bar: color: hash', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'progress-bar: color';
    const {
        SUPERTAPE_PROGRESS_BAR_COLOR,
        TERMINAL_EMULATOR,
    } = env;
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR_COLOR: undefined,
        TERMINAL_EMULATOR: undefined,
    });
    
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn);
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR_COLOR,
        TERMINAL_EMULATOR,
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

test('supertape: format: progress bar: getStream: no SUPERTAPE_PROGRESS_BAR', (t) => {
    const {SUPERTAPE_PROGRESS_BAR} = env;
    const {_isCI} = global;
    
    global._isCI = 1;
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR: '0',
    });
    
    const stream = progressBar._getStream({
        total: 1,
    });
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR,
    });
    
    global._isCI = _isCI;
    
    t.notEqual(stream, process.stderr);
    t.end();
});

test('supertape: format: progress bar: getStream: SUPERTAPE_PROGRESS_BAR', (t) => {
    const {SUPERTAPE_PROGRESS_BAR} = env;
    
    const {_isCI} = global;
    
    global._isCI = false;
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR: '1',
    });
    
    const stream = progressBar._getStream({
        total: 100,
    });
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR,
    });
    
    global._isCI = _isCI;
    
    t.equal(stream, process.stderr);
    t.end();
});

test('supertape: format: progress bar: getStream: SUPERTAPE_PROGRESS_BAR, no CI', (t) => {
    const {
        CI,
        SUPERTAPE_PROGRESS_BAR,
    } = env;
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR: '1',
    });
    
    delete global._isCI;
    
    const stream = progressBar._getStream();
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR,
    });
    
    global._isCI = CI;
    
    t.equal(stream, process.stderr);
    t.end();
});

test('supertape: format: progress bar: testEnd', (t) => {
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
    
    const {testEnd} = progressBar.createFormatter(bar);
    
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
    }];
    
    t.calledWith(increment, expected);
    t.end();
});

test('supertape: format: progress bar: no stack', async (t) => {
    const fn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const message = 'progress-bar: success';
    const {CI} = env;
    
    updateEnv({
        SUPERTAPE_PROGRESS_BAR_STACK: '0',
    });
    
    global._isCI = true;
    const {
        run,
        test,
        stream,
    } = await createTest({
        formatter: progressBar,
    });
    
    test(message, fn);
    
    const [output] = await Promise.all([
        pull(stream, 19),
        run(),
    ]);
    
    const result = output.replace(/at .+\n/, 'at  xxx\n');
    
    delete env.SUPERTAPE_PROGRESS_BAR_STACK;
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

function updateEnv(env) {
    for (const [name, value] of Object.entries(env)) {
        if (value) {
            process.env[name] = value;
            continue;
        }
        
        delete process.env[name];
    }
}
