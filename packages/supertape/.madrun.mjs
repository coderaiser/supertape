import {run} from 'madrun';

export default {
    'test': () => `bin/supertape.js '{bin,lib}/**/*.spec.{js,mjs}'`,
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'coverage': () => `c8 npm test`,
    'report': () => 'c8 report --reporter=text-lcov | coveralls',
    'wisdom': () => run(['lint', 'coverage']),
};

