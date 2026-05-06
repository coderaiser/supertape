import {run, cutEnv} from 'madrun';

const dirs = ['packages'];
const env = {
    NODE_OPTIONS: '"--unhandled-rejections=strict"',
};

export default {
    'test': () => [env, `tape '${dirs}/*/test/*.js' '${dirs}/*/{bin,lib}/**/*.spec.js'`],
    'test:tap': () => `tape '${dirs}/*/test/*.js' '${dirs}/*/lib/**/*.spec.js'`,
    'test:fail': async () => [env, `"${await cutEnv('test')}" -f fail`],
    'test:slow': () => 'lerna run test',
    'coverage:long': async () => [env, `c8 ${await cutEnv('test')}`],
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
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
    'prelint': () => 'redlint fix',
    'lint:mark': () => 'putout **/*.md',
    'memory': () => run('lint:fresh', '-f memory'),
    'fix:lint': () => run('lint', '--fix'),
    'fix:lint:fresh': () => run('fix:lint', '--fresh'),
    'fix:lint:cache': () => run('lint:cache', '--fix'),
    'fix:lint:slow': () => 'lerna run --no-bail fix:lint',
    'bootstrap': () => 'npm i',
    'report': () => `c8 report --reporter=lcov`,
    'prepare': () => 'husky',
};
