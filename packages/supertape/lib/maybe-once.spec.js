import {test} from 'supertape';
import {maybeOnce} from './maybe-once.js';

test('supertape: maybe-once', (t) => {
    let i = 0;
    const fn = maybeOnce(() => ++i);
    
    fn();
    fn();
    
    const result = fn();
    
    t.equal(result, 1);
    t.end();
});

test('supertape: maybe-once: once disabled', (t) => {
    let i = 0;
    const fn = maybeOnce(() => ++i);
    
    globalThis.onceDisabled = true;
    
    fn();
    fn();
    
    const result = fn();
    
    globalThis.onceDisabled = true;
    
    t.equal(result, 3);
    t.end();
});

