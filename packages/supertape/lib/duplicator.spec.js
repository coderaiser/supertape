'use strict';

const {
    stub,
    test,
} = require('..');

const mockRequire = require('mock-require');
const {getDuplicatesMessage} = require('./duplicator');

const {stopAll, reRequire} = mockRequire;

test('supertape: getDuplicatesMessage', (t) => {
    const message = 'hello';
    const checkDuplicates = true;
    const StackTracey = stub().returns({
        items: [],
    });
    
    mockRequire('stacktracey', StackTracey);
    
    const {getDuplicatesMessage} = reRequire('./duplicator');
    getDuplicatesMessage({
        message,
        checkDuplicates,
    });
    
    const result = getDuplicatesMessage({
        message,
        checkDuplicates,
    });
    
    stopAll();
    
    t.equal(result, '');
    t.end();
});

test('supertape: getDuplicatesMessage: duplicate', (t) => {
    const message = 'hello';
    const checkDuplicates = true;
    
    getDuplicatesMessage({
        message,
        checkDuplicates,
    });
    
    const result = getDuplicatesMessage({
        message,
        checkDuplicates,
    });
    
    t.match(result, 'Duplicate message');
    t.end();
});
