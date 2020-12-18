import {test} from 'supertape';
import tryToCatch from 'try-to-catch';
import {loadOperators} from './loader.js';

test('supertape: engine: loader', async (t) => {
    const result = await loadOperators([
        'stub',
    ]);
    
    const expected = await import('@supertape/operator-stub');
    
    t.deepEqual(result, expected);
    t.end();
});

test('supertape: engine: loader: not found', async (t) => {
    const [error] = await tryToCatch(loadOperators, [
        'not-found',
    ]);
    
    const expected = 'Operator "supertape-operator-not-found" could not be found!';
    
    t.equal(error.message, expected);
    t.end();
});

