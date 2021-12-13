import {run} from 'madrun';

const NODE_OPTIONS = `'--loader mock-import --no-warnings'`;
const env = {
    NODE_OPTIONS,
}

export default {
    'test': () => [env, `supertape 'lib/**/*.spec.js'`],
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': () => `c8 npm test`,
    'report': () => 'c8 report --reporter=lcov',
    'wisdom': () => run(['lint', 'coverage']),
};

