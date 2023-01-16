import montag from 'montag';
import pullout from 'pullout';

import {
    test,
    createTest,
} from 'supertape';

import * as failFormatter from './fail.js';

const pull = async (stream, i = 9) => {
    const output = await pullout(await stream);
    
    return output.split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: format: fail', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'format: success';
    
    const failFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const failMessage = 'format: fail';
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        format: failFormatter,
    });
    
    test(successMessage, successFn);
    test(failMessage, failFn);
    
    const [result] = await Promise.all([
        pull(stream),
        run(),
    ]);
    
    const expected = montag`
        TAP version 13
        # format: fail
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

test('supertape: format: fail: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'skip: success';
    
    const {
        test,
        stream,
        run,
    } = await createTest({
        format: failFormatter,
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
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

