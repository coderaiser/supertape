import {createTest} from '@putout/test';
import * as plugin from './index.js';

const test = createTest(import.meta.url, {
    plugins: [
        ['declare', plugin],
    ],
});

test('lib: declare: report', (t) => {
    t.report('declare', `Declare 'Inject', it referenced but not defined`);
    t.end();
});

test('lib: declare: transform', (t) => {
    t.transform('declare');
    t.end();
});
