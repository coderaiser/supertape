import {
    run,
    cutEnv,
} from 'madrun';

const env = {
    SUPERTAPE_PROGRESS_BAR_STACK: 0,
};

export default {
    'test': () => [env, `bin/supertape.mjs '{bin,lib}/**/*.spec.{js,mjs}'`],
    'test:dts': () => 'check-dts',
    'watch:test': async () => `nodemon -w lib -w test -x "${await cutEnv('test')}"`,
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
    'report': () => 'c8 report --reporter=lcov',
    'wisdom': () => run(['lint', 'test:dts', 'coverage']),
};

