'use strict';

const {once} = require('events');
const {Transform} = require('stream');

const test = require('../..');
const {createHarness} = require('./harness');

test('supertape: harness: proceed condition', (t) => {
    const reporter = {
        test: () => '',
    };
    
    let length = 1;
    const input = createHarness(reporter);
    
    const output = new Transform({
        transform(chunk, enc, callback) {
            ({length} = chunk);
            callback();
        },
    });
    
    input.pipe(output);
    
    input.write({
        type: 'test',
    });
    
    t.ok(length, 'should proceed only when reporter return not zero length chunk');
    t.end();
});

test('supertape: harness: proceed condition: write after end', async (t) => {
    const reporter = {
        test: () => '',
    };
    
    const input = createHarness(reporter);
    
    const output = new Transform({
        transform(chunk, enc, callback) {
            callback();
        },
    });
    
    input.pipe(output);
    
    input.write({
        type: 'end',
    });
    
    const [[error]] = await Promise.all([
        once(input, 'error'),
        input.write({
            type: 'test',
        }),
    ]);
    
    t.equal(error.message, `☝️ Looks like 'async' operator called without 'await'`);
    t.end();
});
