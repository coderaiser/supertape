'use strict';

const {safeAlign} = require('eslint-plugin-putout/config');
const {matchToFlat} = require('@putout/eslint-flat');

const match = {
    '*.d.ts': {
        'no-var': 'off',
    },
    '*.spec.*': {
        'node/no-extraneous-import': 'off',
    },
};

module.exports = [
    ...safeAlign,
    ...matchToFlat(match),
];

module.exports.match = match;
