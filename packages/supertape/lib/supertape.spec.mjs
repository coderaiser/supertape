import test, {
    extend,
    stub,
} from './supertape.mjs';

const extendedTest = extend({
    superOk: (operator) => (a) => {
        return operator.ok(a, 'should be super ok');
    },
});

test('supertape: mjs: default', (t) => {
    t.equal(1, 1);
    t.end();
});

test('supertape: mjs: default', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledWith(fn, ['hello']);
    t.end();
});

extendedTest('supertape: mjs: extend', (t) => {
    t.superOk(true);
    t.end();
});
