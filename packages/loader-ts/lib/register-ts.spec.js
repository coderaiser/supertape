import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import './register-ts.js';

const importFn = (a) => import(a);

test('supertape: loader: register: ts: syntax error', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/syntax-error.ts');
    
    t.match(error.message, `Unexpected token`);
    t.end();
});

test('supertape: loader: register: ts', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/register.ts');
    const expected = 'Inject is not defined';
    
    t.equal(error.message, expected);
    t.end();
});

test('supertape: loader: register: ts: external', async (t) => {
    const {Time} = await import('./fixture/external.ts');
    
    t.ok(typeof Time, 'function');
    t.end();
});
