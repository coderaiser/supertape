import {createTest} from '@putout/test';
import * as plugin from './index.js';

const test = createTest(import.meta.url, {
    plugins: [
        ['apply-inject', plugin],
    ],
});

test('lib: apply-inject: report', (t) => {
    t.report('apply-inject', `Apply @Inject`);
    t.end();
});

test('lib: apply-inject: transform', (t) => {
    t.transform('apply-inject');
    t.end();
});
