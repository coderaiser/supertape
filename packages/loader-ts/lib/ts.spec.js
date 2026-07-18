import {test} from 'supertape';
import {resolve} from './ts.js';

test('supertape: loader-ts', (t) => {
    const {url} = import.meta;
    const result = resolve('hello.ts', {
        parentURL: url,
    });
    
    const expected = {
        url: new URL('hello.ts', url).href,
        shortCircuit: true,
    };
    
    t.deepEqual(result, expected);
    t.end();
});
