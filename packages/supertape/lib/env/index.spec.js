import {test} from 'supertape';
import {defineEnv} from 'supertape/env';

test('supertape: env: defineEnv', (t) => {
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
        NODE_OPTIONS: '"--unhandled-rejections=strict --import supertape/css"',
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
        SUPERTAPE_CHECK_ASSERTIONS_COUNT: 0,
        SUPERTAPE_CHECK_SCOPES: 1,
    };
    
    t.deepEqual(result, expected);
    t.end();
});
