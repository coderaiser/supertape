import {run, cutEnv} from 'madrun';
import {defineEnv} from 'supertape/env';

const testEnv = defineEnv({
    jsx: true,
    dom: true,
});

const env = {
    ...testEnv,
    FORCE_COLOR: 1,
};

export default {
    'test': () => [env, `supertape 'lib/**/*.test.js'`],
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
