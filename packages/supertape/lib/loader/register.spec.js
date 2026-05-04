import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import './register.js';

const importFn = (a) => import(a);

test('supertape: loader: register: css', async (t) => {
    await import('./fixture/style.css');
    
    t.pass('should import css file');
    t.end();
});

test('supertape: loader: register: jsx', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/register.jsx');
    const expected = 'react';
    
    t.match(error.message, expected);
    t.end();
});
