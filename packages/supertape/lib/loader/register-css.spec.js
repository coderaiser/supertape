import {test} from 'supertape';
import './register-css.js';

test('supertape: loader: register: css', async (t) => {
    await import('./fixture/style.css');
    
    t.pass('should import css file');
    t.end();
});
