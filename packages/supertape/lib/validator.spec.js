'use strict';

const tryCatch = require('try-catch');

const mockRequire = require('mock-require');
const {stub, test} = require('..');

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
    
    const expected = [
        `Scope should be defined before first colon: 'scope: subject', received: 'hello world'`,
        'at',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkScopes: @', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: '@putout/eslint: create-plugin',
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('@putout/eslint: create-plugin');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkScopes: +', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: '+hello: world',
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('+hello: world');
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkAssertionsCount', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: 'hello world',
        at: 'at',
        validations: {
            checkAssertionsCount: true,
        },
    };
    
    const tests = [current];
    
    setValidations({
        checkAssertionsCount: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello world', {
        assertionsCount: 2,
    });
    
    const expected = [
        'Only one assertion per test allowed, looks like you have more',
        'at',
    ];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkAssertionsCount: disabled', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: 'hello world',
        at: 'at',
        validations: {
            checkAssertionsCount: false,
        },
    };
    
    const tests = [current];
    
    setValidations({
        checkAssertionsCount: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello world', {
        assertionsCount: 2,
    });
    
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkAssertionsCount: ok', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const current = {
        message: 'hello world',
        at: 'at',
        validations: {
            checkAssertionsCount: true,
        },
    };
    
    const tests = [current];
    
    setValidations({
        checkAssertionsCount: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello world', {
        assertionsCount: 1,
    });
    
    const expected = [];
    
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

test('supertape: validator: checkScopes: nested: valid', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const message = 'hello: world: and: more';
    const current = {
        message,
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate(message);
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: checkScopes: nested: slash', (t) => {
    const {
        createValidator,
        setValidations,
    } = reRequire('./validator');
    
    const message = 'travis/set-node-versions: report: is function';
    const current = {
        message,
        at: 'at',
    };
    
    const tests = [current];
    
    setValidations({
        checkScopes: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate(message);
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
    const expected = '☝️Looks like message cannot be find in tests, this should never happen';
    
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
