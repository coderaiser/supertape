import {run, cutEnv} from 'madrun';

const env = {
    SUPERTAPE_PROGRESS_BAR_STACK: 0,
};

export default {
    'test': () => [env, `bin/tracer.js '{bin,lib}/**/*.spec.*'`],
    'test:dts': () => 'check-dts test/*.ts',
    
    'lint': () => 'putout .',
    'fresh:lint': () => run('lint', '--fresh'),
    'lint:fresh': () => run('lint', '--fresh'),
    'fix:lint': () => run('lint', '--fix'),
    'coverage': async () => [env, `c8 ${await cutEnv('test')}`],
    'report': () => 'c8 report --reporter=lcov',
    'wisdom': () => run(['lint', 'test:dts', 'coverage']),
    'watch:test': async () => [env, `nodemon -w bin -w lib -w test -x "${await cutEnv('test')} -f tap"`],
};
