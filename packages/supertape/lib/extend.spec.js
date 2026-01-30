import {once} from 'node:events';
import {test} from './supertape.js';

const {
    extend,
    stub,
    run,
} = test;

const extendedTest = extend({
    superOk: (operator) => (a) => {
        return operator.ok(a, 'should be super ok');
    },
});

test('supertape: mjs: default: equal', (t) => {
    t.equal(1, 1);
    t.end();
});

test('supertape: mjs: default: calledWith', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledWith(fn, ['hello']);
    t.end();
});

test('supertape: run', async (t) => {
    const emitter = run({
        fake: true,
    });
    
    const [result] = await once(emitter, 'end');
    const expected = {
        failed: 0,
    };
    
    t.deepEqual(result, expected);
    t.end();
});

extendedTest('supertape: mjs: extend', (t) => {
    t.superOk(true);
    t.end();
});
