import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import './register-jsx.js';

const importFn = (a) => import(a);

test('supertape: loader: register: jsx', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/register.jsx');
    
    t.notOk(error);
    t.end();
});

test('supertape: loader: register: jsx: syntax error', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/syntax-error.js');
    
    t.equal(error.message, 'Unexpected token');
    t.end();
});

test('supertape: loader: register: js', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/register.js');
    
    t.notOk(error);
    t.end();
});

test('supertape: loader: register: js: external', async (t) => {
    const {Time} = await import('./fixture/external.js');
    
    t.ok(typeof Time, 'function');
    t.end();
});
