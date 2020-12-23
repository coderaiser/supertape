import {run} from 'madrun';

const C8_OPTIONS = [
    '--exclude="**/{bin,lib}/**/{fixture,*.spec.{js,mjs}}"',
    '--check-coverage --lines 100 --functions 100 --branches 100',
].join(' ');

export default {
    'test': () => `bin/supertape.js '{bin,lib}/**/*.spec.{js,mjs}'`,
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'coverage': () => `c8 ${C8_OPTIONS} npm test`,
    'report': () => 'c8 report --reporter=text-lcov | coveralls',
    'wisdom': () => run(['lint', 'coverage']),
};

