import {extend} from 'supertape';
import stub from '@cloudcmd/stub';

import * as operator from './stub.js';

const test = extend(operator);

test('supertape: operator: stub: not called', (t) => {
    const fn = stub();
    
    t.notCalled(fn);
    t.end();
});

test('supertape: operator: stub: called', (t) => {
    const fn = stub();
    
    fn();
    
    t.called(fn);
    t.end();
});

test('supertape: operator: stub: called with', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledWith(fn, ['hello']);
    t.end();
});

test('supertape: operator: stub: called count', (t) => {
    const fn = stub();
    
    fn();
    fn();
    
    t.calledCount(fn, 2);
    t.end();
});

test('supertape: operator: stub: called once', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledOnce(fn);
    t.end();
});

test('supertape: operator: stub: called twice', (t) => {
    const fn = stub();
    
    fn('hello');
    fn('world');
    
    t.calledTwice(fn);
    t.end();
});

test('supertape: operator: stub: called twice', (t) => {
    const fn = stub();
    
    new fn('hello');
    
    t.calledWithNew(fn);
    t.end();
});

test('supertape: operator: stub: calledWith: last', (t) => {
    const fn = stub();
    
    fn('hello');
    fn('world');
    
    t.calledWith(fn, ['world']);
    t.end();
});
