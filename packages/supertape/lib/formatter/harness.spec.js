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
    
    t.ok(length, 'should proceed only when reporter return not zero length chunk');
    t.end();
});
