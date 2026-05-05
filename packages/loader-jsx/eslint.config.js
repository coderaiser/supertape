import {defineConfig} from 'eslint/config';
import {safeAlign} from 'eslint-plugin-putout';
import {matchToFlat} from '@putout/eslint-flat';

export const match = {
    '**/register*.js': {
        'n/no-unsupported-features/node-builtins': 'off',
    },
};

export default defineConfig([safeAlign, matchToFlat(match)]);
