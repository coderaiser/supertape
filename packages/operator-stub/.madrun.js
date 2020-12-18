import {run} from 'madrun';

const C8_OPTIONS = [
    '--exclude="**/lib/**/{fixture,*.spec.js}"',
    '--check-coverage --lines 100 --functions 100 --branches 100',
].join(' ');

export default {
    'test': () => `supertape 'lib/**/*.spec.js'`,
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'coverage': () => `c8 ${C8_OPTIONS} npm test`,
    'report': () => 'c8 report --reporter=text-lcov | coveralls',
    'wisdom': () => run(['lint', 'coverage']),
};

