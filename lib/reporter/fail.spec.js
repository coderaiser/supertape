'use strict';

const {once} = require('events');

const montag = require('montag');
const {reRequire} = require('mock-require');
const pullout = require('pullout');

const test = require('../..');

const pull = async (stream, i = 9) => {
    const output = await pullout(stream);
    
    return output.split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: format: fail', async (t) => {
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
    
    const supertape = reRequire('../..');
    
    supertape.init({
        quiet: true,
        format: 'fail',
    });
    
    supertape(successMessage, successFn);
    supertape(failMessage, failFn);
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(supertape.run(), 'end'),
    ]);
    
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

