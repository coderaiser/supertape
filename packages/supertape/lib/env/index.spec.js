import {test} from 'supertape';
import {defineEnv} from 'supertape/env';

test('supertape: env: defineEnv: css', (t) => {
    const NODE_OPTIONS = '--unhandled-rejections=strict';
    const env = {
        NODE_OPTIONS,
    };
    
    const result = defineEnv({
        timeout: 7000,
        css: true,
    }, {
        env,
    });
    
    const expected = {
        SUPERTAPE_TIMEOUT: 7000,
        NODE_OPTIONS: '"--unhandled-rejections=strict --import @supertape/loader-css"',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: env: defineEnv: jsx', (t) => {
    const NODE_OPTIONS = '--unhandled-rejections=strict';
    const env = {
        NODE_OPTIONS,
    };
    
    const result = defineEnv({
        timeout: 7000,
        jsx: true,
    }, {
        env,
    });
    
    const expected = {
        SUPERTAPE_TIMEOUT: 7000,
        NODE_OPTIONS: '"--unhandled-rejections=strict --import @supertape/loader-jsx"',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: env: defineEnv: dom', (t) => {
    const NODE_OPTIONS = '--unhandled-rejections=strict';
    const env = {
        NODE_OPTIONS,
    };
    
    const result = defineEnv({
        timeout: 7000,
        jsx: true,
        dom: true,
    }, {
        env,
    });
    
    const expected = {
        SUPERTAPE_TIMEOUT: 7000,
        NODE_OPTIONS: '"--unhandled-rejections=strict --import @supertape/loader-jsx --import @supertape/loader-dom"',
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: env: defineEnv: options', (t) => {
    const result = defineEnv({
        checkAssertionsCount: false,
        checkScopes: true,
    });
    
    const expected = {
        NODE_OPTIONS: `"--unhandled-rejections=strict"`,
        SUPERTAPE_CHECK_ASSERTIONS_COUNT: 0,
        SUPERTAPE_CHECK_SCOPES: 1,
    };
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: env: defineEnv: ts', (t) => {
    const NODE_OPTIONS = '--unhandled-rejections=strict';
    const env = {
        NODE_OPTIONS,
    };
    
    const result = defineEnv({
        timeout: 7000,
        ts: true,
    }, {
        env,
    });
    
    const expected = {
        SUPERTAPE_TIMEOUT: 7000,
        NODE_OPTIONS: '"--unhandled-rejections=strict --import @supertape/loader-ts"',
    };
    
    t.deepEqual(result, expected);
    t.end();
});
