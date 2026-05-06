import {test} from 'supertape';
import './register-dom.js';

test('supertape: loader: register: dom', async (t) => {
    const {element} = await import('./fixture/dom.js');
    
    t.ok(element);
    t.end();
});
