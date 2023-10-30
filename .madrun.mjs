import {run} from 'madrun';

const dirs = ['packages'];

export default {
    'test': () => `tape --check-scopes --check-assertions-count '${dirs}/*/test/*.{js,mjs}' '${dirs}/*/lib/**/*.spec.{js,mjs}'`,
    'test:dts': () => 'cd packages/supertape && check-dts',
    'test:tap': () => `tape '${dirs}/*/test/*.{js,mjs}' '${dirs}/*/lib/**/*.spec.{js,mjs}'`,
    'test:fail': async () => `${await run('test')} -f fail`,
    'test:slow': () => 'lerna run test',
    'coverage:long': async () => `c8 ${await run('test')}`,
    'coverage': async () => `c8 ${await run('test')}`,
    'coverage:tap': async () => `c8 ${await run('test:tap')}`,
    'coverage:slow': () => 'lerna run coverage',
    'lint:slow': () => 'lerna run --no-bail lint',
    'lint-all': async () => `MADRUN_NAME=1 ${await run('lint:*')}`,
    'lint:frame': () => run('lint:ci', '-f codeframe'),
    'lint:fresh': () => run('lint', '--fresh'),
    'lint:memory': () => run('lint:fresh', '-f memory'),
    'fresh:lint': () => run('lint:fresh'),
    'fresh': () => run(['lint:memory', 'coverage']),
    'lint': () => `putout . --rulesdir rules`,
    'lint:mark': () => 'putout **/*.md',
    'memory': () => run('lint:fresh', '-f memory'),
    'fix:lint': () => run('lint', '--fix'),
    'fix:lint:fresh': () => run('fix:lint', '--fresh'),
    'fix:lint:cache': () => run('lint:cache', '--fix'),
    'fix:lint:slow': () => 'lerna run --no-bail fix:lint',
    'bootstrap': () => 'npm i',
    'report': () => `c8 report --reporter=lcov`,
    'prepare': () => 'husky install',
};
