import {test} from 'supertape';
import {tryToCatch} from 'try-to-catch';
import './register-nestjs.js';

const importFn = (a) => import(a);

test('supertape: loader: register: nestjs: syntax error', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/syntax-error.ts');
    
    t.equal(error.message, `Unexpected token (2:0)`);
    t.end();
});

test('supertape: loader: register: ts', async (t) => {
    const [error] = await tryToCatch(importFn, './fixture/register.ts');
    
    t.match(error.message, `Inject is not defined`);
    t.end();
});

test('supertape: loader: register: nestjs: external', async (t) => {
    const {Time} = await import('./fixture/external.ts');
    
    t.ok(typeof Time, 'function');
    t.end();
});
