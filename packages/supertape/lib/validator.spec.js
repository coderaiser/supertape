'use strict';

const tryCatch = require('try-catch');

const {
    stub,
    test,
} = require('..');

const mockRequire = require('mock-require');
const {getAt} = require('./validator');

const {stopAll, reRequire} = mockRequire;

test('supertape: validator: getAt', (t) => {
    const message = 'hello';
    const checkDuplicates = true;
    const StackTracey = stub().returns({
        items: [],
    });
    
    mockRequire('stacktracey', StackTracey);
    
    const {getAt} = reRequire('./validator');
    getAt({
        message,
        checkDuplicates,
    });
    
    const result = getAt({
        message,
        checkDuplicates,
    });
    
    stopAll();
    
    t.equal(result, '');
    t.end();
});

test('supertape: validator: getAt: duplicate', (t) => {
    const message = 'hello';
    const checkDuplicates = true;
    
    getAt({
        message,
        checkDuplicates,
    });
    
    const result = getAt({
        message,
        checkDuplicates,
    });
    
    t.match(result, 'at');
    t.end();
});

test('supertape: validator: checkScopes', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    const current = {
        message: 'hello world',
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello world');
    const expected = [`Scope should be defined before first colon: 'scope: subject', example: 'supertape: validator: enabled'`, 'at'];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkScopes: valid', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: 'hello: world',
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello: world');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkScopes: cannot find message', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: 'hello: world',
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const [error] = tryCatch(validate, 'hello  world');
    const expected = '☝️Looks like message cannot be fined in tests, this should never happen';
    
    t.equal(error.message, expected);
    t.end();
});

test('supertape: validator: no validations', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    const current = {
        message: 'hello world',
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: false,
        checkDuplicates: false,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello world');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

