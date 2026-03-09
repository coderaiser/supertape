import {run, cutEnv} from 'madrun';

const env = {
    FORCE_COLOR: 1,
};

export default {
    'test': () => [env, `supertape 'lib/**/*.spec.js'`],
    'test:dts': () => 'check-dts',
    'watch:test': async () => [env, `nodemon -w lib -w test -x "${await cutEnv('test')}"`],
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
    'report': () => [env, 'c8 report --reporter=lcov'],
    'wisdom': () => run(['lint', 'coverage', 'test:dts']),
};
