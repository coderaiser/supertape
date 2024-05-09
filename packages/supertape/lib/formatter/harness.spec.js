'use strict';

const {stub} = require('supertape');
const {once} = require('node:events');
const {Transform} = require('node:stream');

const test = require('../..');
const {createHarness} = require('./harness');
const {keys} = Object;

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

test('supertape: harness: no readableObjectMode, since it breaks console.log', (t) => {
    const reporter = {
        test: () => '',
    };
    
    const Transform = stub();
    
    createHarness(reporter, {
        Transform,
    });
    
    const {args} = Transform;
    const [[arg]] = args;
    const result = keys(arg);
    
    const expected = [
        'writableObjectMode',
        'transform',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});
