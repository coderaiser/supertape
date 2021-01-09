import {run} from 'madrun';

export default {
    'test': () => `supertape 'lib/**/*.spec.js'`,
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': () => `c8 npm test`,
    'report': () => 'c8 report --reporter=text-lcov | coveralls',
    'wisdom': () => run(['lint', 'coverage']),
};

