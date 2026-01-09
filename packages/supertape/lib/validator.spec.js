import {tryCatch} from 'try-catch';
import {stub, test} from './supertape.js';
import {
    getAt,
    createValidator,
    setValidations,
} from './validator.js';

test('supertape: validator: getAt', (t) => {
    const StackTracey = stub().returns({
        items: [],
    });
    
    const result = getAt({
        StackTracey,
    });
    
    t.equal(result, '');
    t.end();
});

test('supertape: validator: getAt: duplicate', (t) => {
    getAt();
    
    const result = getAt();
    
    t.match(result, 'at');
    t.end();
});

test('supertape: validator: checkScopes', (t) => {
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

test('supertape: validator: checkDuplicates', (t) => {
    const current = {
        message: 'hello world',
        at: 'at',
        validations: {
            checkDuplicates: false,
        },
    };
    
    const tests = [current, current];
    
    setValidations({
        checkScopes: false,
        checkDuplicates: true,
    });
    
    const validate = createValidator({
        tests,
    });
    
    const result = validate('hello world');
    
    const expected = [];
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: validator: no node_modules', (t) => {
    const items = [{
        beforeParse: 'at getDuplicatesMessage (/node_modules/supertape/lib/supertape.js:113:37)',
        file: '/node_modules/supertape/lib/supertape.js',
    }, {
        beforeParse: 'at test (/node_modules/supertape/lib/supertape.js:144:31)',
        file: '/node_modules/supertape/lib/supertape.js',
    }, {
        beforeParse: 'at only (/node_modules/supertape/lib/supertape.js:144:31)',
        file: '/node_modules/supertape/lib/supertape.js',
    }, {
        beforeParse: 'at Object.<anonymous> (/Users/coderaiser/putout/packages/traverse/lib/traverse.spec.js:123:1)',
        file: '/Users/coderaiser/putout/packages/traverse/lib/traverse.spec.js',
    }];
    
    const StackTracey = stub().returns({
        items,
    });
    
    const result = getAt({
        StackTracey,
    });
    
    t.notMatch(result, 'node_modules');
    t.end();
});
