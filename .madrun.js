import {run} from 'madrun';

const NODE_OPTIONS = `'--loader mock-import'`;

export default {
    'test:base': () => `node bin/supertape.js 'test/*.js'`,
    'test': () => run('test:base', '', {
        NODE_OPTIONS,
    }),
    'watch:test': async () => `nodemon -w lib -w test -x "${await run('test')}"`,
    'lint': () => 'putout .',
    'fix:lint': () => run('lint', '--fix'),
    'coverage:base': async () => `c8 --exclude="{bin,test}" ${await run('test:base')}`,
    'coverage': () => run('coverage:base', '', {
        NODE_OPTIONS,
    }),
    'report': () => 'nyc report --reporter=text-lcov | coveralls',
};

