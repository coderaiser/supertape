import {createTest} from '@putout/test';
import * as plugin from './index.js';

const test = createTest(import.meta.url, {
    plugins: [
        ['apply-c8-ignore', plugin],
    ],
});

test('lib: apply-c8-ignore: report', (t) => {
    t.report('apply-c8-ignore', `3`);
    t.end();
});

test('lib: apply-c8-ignore: transform', (t) => {
    t.transform('apply-c8-ignore');
    t.end();
});
