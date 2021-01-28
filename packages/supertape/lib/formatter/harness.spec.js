'use strict';

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
    
    t.ok(length, 'should proceed ony when reporter return not zero length chunk');
    t.end();
});

test('supertape: harness: Error: stream.push() after EOF', (t) => {
    const reporter = {
        test: () => 'hello world',
    };
    
    const push = () => {
        throw Error('x');
    };
    
    const input = createHarness(reporter, {push});
    const output = new Transform({
        transform(chunk, enc, callback) {
            callback();
        },
    });
    
    input.pipe(output);
    
    input.write({
        type: 'test',
        test: 'hello',
    });
    
    t.pass('should not throw');
    t.end();
});

