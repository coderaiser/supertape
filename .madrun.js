'use strict';

const {run} = require('madrun');
const dirs = [
    'packages',
];

const C8_OPTIONS = [
    '--exclude="**/lib/**/{fixture,*.spec.js}"',
    '--check-coverage --lines 100 --functions 100 --branches 100',
].join(' ');

module.exports = {
    'test': () => `tape '${dirs}/*/test/*.js' '${dirs}/*/lib/**/*.spec.js' -f progress-bar`,
    'test:fail': async () => `${await run('test')} -f fail`,
    'test:slow': () => 'lerna run test',
    'coverage:long': async () => `c8 ${await run('test')}`,
    'coverage': async () => `c8 ${C8_OPTIONS} ${await run('test')}`,
    'coverage:slow': () => 'lerna run coverage',
    'lint:slow': () => 'lerna run --no-bail lint',
    'lint-all': async () => `MADRUN_NAME=1 ${await run('lint:*')}`,
    'lint:frame': () => run('lint:ci', '-f codeframe'),
    'lint:fresh': () => run('lint', '--fresh'),
    'lint:memory': () => run('lint:fresh', '-f memory'),
    'fresh:lint': () => run('lint:fresh'),
    'fresh': () => run(['lint:memory', 'coverage']),
    'lint': () => `putout .`,
    'lint:mark': () => 'putout **/*.md',
    'memory': () => run(['lint:fresh', '-f memory']),
    'fix:lint': () => run('lint', '--fix'),
    'fix:lint:fresh': () => run('fix:lint', '--fresh'),
    'fix:lint:cache': () => run('lint:cache', '--fix'),
    'fix:lint:slow': () => 'lerna run --no-bail fix:lint',
    'bootstrap': () => 'lerna bootstrap',
    'report': () => `c8 report --reporter=text-lcov | coveralls`,
};

