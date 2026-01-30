import {test} from 'supertape';
import './register.js';

test('supertape: loader: register', async (t) => {
    await import('./fixture/style.css');
    
    t.pass('shoud import css file');
    t.end();
});
