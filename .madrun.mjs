import {run} from 'madrun';

export default {
    'test': () => `node bin/supertape.mjs 'test/*.{js,mjs}'`,
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'coverage': () => 'nyc npm test',
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
};

