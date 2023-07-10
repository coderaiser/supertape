import {
    stub,
    extend,
} from 'supertape';
import * as operator from './stub.js';

const noop = () => {};

const test = extend(operator);

test('supertape: operator: stub: not called', (t) => {
    const fn = stub();
    
    t.notCalled(fn);
    t.end();
});

test('supertape: operator: stub: not called: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const notCalled = operator.notCalled({
        fail,
    });
    
    notCalled(fn);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: not called: not arg', (t) => {
    const fail = stub();
    
    const notCalled = operator.notCalled({
        fail,
    });
    
    notCalled();
    
    t.calledWith(fail, [`Expected stub, but received: undefined`]);
    t.end();
});

test('supertape: operator: stub: called', (t) => {
    const fn = stub();
    const fail = stub();
    
    const called = operator.called({
        fail,
    });
    
    called(fn);
    
    t.calledWith(fail, [`'t.called' is too general, looks like you need 't.calledWith' or 't.calledWithNoArgs'`]);
    t.end();
});

test('supertape: operator: stub: called: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const called = operator.called({
        fail,
    });
    
    called(fn);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: called with', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledWith(fn, ['hello']);
    t.end();
});

test('supertape: operator: stub: calledWith: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const calledWith = operator.calledWith({
        fail,
    });
    
    calledWith(fn, []);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: calledWith: not array', (t) => {
    const fn = stub();
    const fail = stub();
    
    const calledWith = operator.calledWith({
        fail,
    });
    
    fn();
    calledWith(fn, 'hello');
    
    t.calledWith(fail, [`Expected 'args' to be 'array' but received: "hello"`]);
    t.end();
});

test('supertape: operator: stub: called count', (t) => {
    const fn = stub();
    
    fn();
    fn();
    
    t.calledCount(fn, 2);
    t.end();
});

test('supertape: operator: stub: calledCount: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const calledCount = operator.calledCount({
        fail,
    });
    
    calledCount(fn, 1);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: called once', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledOnce(fn);
    t.end();
});

test('supertape: operator: stub: calledOnce: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const calledOnce = operator.calledOnce({
        fail,
    });
    
    calledOnce(fn);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: called twice', (t) => {
    const fn = stub();
    
    fn('hello');
    fn('world');
    
    t.calledTwice(fn);
    t.end();
});

test('supertape: operator: stub: called with new', (t) => {
    const fn = stub();
    
    new fn();
    
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

test('supertape: operator: stub: calledWith: deep equals', (t) => {
    const fn = stub();
    
    const obj = {
        hello: 'world',
        f: noop,
    };
    
    fn(obj);
    
    t.calledWith(fn, [{
        hello: 'world',
        f: noop,
    }]);
    t.end();
});

test('supertape: operator: stub: calledWith called with no args', (t) => {
    const fn = stub();
    const fail = stub();
    
    const calledWith = operator.calledWith({
        fail,
    });
    
    fn();
    calledWith(fn);
    
    t.calledWith(fail, [`You haven't provided 'args', looks like you need 't.calledWithNoArgs()'`]);
    t.end();
});

test('supertape: operator: stub: calledWith: not called', (t) => {
    const fn = stub();
    const fail = stub();
    
    const calledWith = operator.calledWith({
        fail,
    });
    
    calledWith(fn, [1, 2]);
    
    t.calledWith(fail, [`Expected function to be called with arguments, but not called at all`]);
    t.end();
});

test('supertape: operator: stub: calledWithNoArgs', (t) => {
    const fn = stub();
    const fail = stub();
    
    const calledWithNoArgs = operator.calledWithNoArgs({
        fail,
    });
    
    calledWithNoArgs(fn);
    
    t.calledWith(fail, [`Expected function to be called with no arguments, but not called at all`]);
    t.end();
});

test('supertape: operator: stub: t.calledWithNoArgs', (t) => {
    const fn = stub();
    
    fn();
    
    t.calledWithNoArgs(fn);
    t.end();
});

test('supertape: operator: stub: calledWithNoArgs: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const calledWithNoArgs = operator.calledWithNoArgs({
        fail,
    });
    
    calledWithNoArgs(fn);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: calledWithNoArgs: more then one argument', (t) => {
    const fn = stub();
    const fail = stub();
    
    const calledWithNoArgs = operator.calledWithNoArgs({
        fail,
    });
    
    fn();
    calledWithNoArgs(fn, []);
    
    t.calledWith(fail, [`'t.calledWithNoArgs' expects message to be string, but received: '[]', looks like you need 't.calledWith'`]);
    t.end();
});

test('supertape: operator: stub: notCalled: more then one argument', (t) => {
    const fn = stub();
    const fail = stub();
    
    const notCalled = operator.notCalled({
        fail,
    });
    
    fn();
    notCalled(fn, []);
    
    t.calledWith(fail, [`'t.notCalled' expects message to be string, but received: '[]', looks like you need 't.notCalledWith'`]);
    t.end();
});

test('supertape: operator: stub: calledWithNew: not stub', (t) => {
    const fn = () => {};
    const fail = stub();
    
    const calledWithNew = operator.calledWithNew({
        fail,
    });
    
    calledWithNew(fn);
    
    t.calledWith(fail, [`Expected stub, but received: ${fn.toString()}`]);
    t.end();
});

test('supertape: operator: stub: calledBefore', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    t.calledBefore(init, show);
    t.end();
});

test('supertape: operator: stub: calledBefore: message', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    const ok = stub();
    const calledBefore = operator.calledBefore({
        ok,
    });
    
    calledBefore(init, show);
    
    t.calledWith(ok, [true, `should call 'init' before 'show'`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: custom message', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    const ok = stub();
    const calledBefore = operator.calledBefore({
        ok,
    });
    
    calledBefore(init, show, 'should call');
    
    t.calledWith(ok, [true, `should call`]);
    t.end();
});

test('supertape: operator: stub: calledAfter', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    t.calledAfter(show, init);
    t.end();
});

test('supertape: operator: stub: calledAfter: message', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    const ok = stub();
    const calledBefore = operator.calledBefore({
        ok,
    });
    
    calledBefore(init, show);
    
    t.calledWith(ok, [true, `should call 'init' before 'show'`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: custom message', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    const ok = stub();
    const calledBefore = operator.calledBefore({
        ok,
    });
    
    calledBefore(init, show, 'should call');
    
    t.calledWith(ok, [true, `should call`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: fn1 not stub', (t) => {
    const init = () => {};
    const show = stub().withName('show');
    
    init();
    show();
    
    const fail = stub();
    const calledAfter = operator.calledAfter({
        fail,
    });
    
    calledAfter(init, show);
    
    t.calledWith(fail, [`Expected stub, but received: () => {}`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: fn2 not stub', (t) => {
    const init = stub().withName('init');
    const show = () => {};
    
    init();
    show();
    
    const fail = stub();
    const calledAfter = operator.calledAfter({
        fail,
    });
    
    calledAfter(init, show);
    
    t.calledWith(fail, [`Expected stub, but received: () => {}`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: fn1 not stub', (t) => {
    const init = () => {};
    const show = stub().withName('show');
    
    init();
    show();
    
    const fail = stub();
    const calledBefore = operator.calledBefore({
        fail,
    });
    
    calledBefore(init, show);
    
    t.calledWith(fail, [`Expected stub, but received: () => {}`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: fn2 not stub', (t) => {
    const init = stub();
    const show = () => {};
    
    init();
    show();
    
    const fail = stub();
    const calledBefore = operator.calledBefore({
        fail,
    });
    
    calledBefore(init, show);
    
    t.calledWith(fail, [`Expected stub, but received: () => {}`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: fn1 not called', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    show();
    
    const fail = stub();
    const calledBefore = operator.calledBefore({
        fail,
    });
    
    calledBefore(init, show);
    
    t.calledWith(fail, [`Expected function 'init' to be called before 'show' but 'init' not called at all`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: fn2 not called', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    
    const fail = stub();
    const calledBefore = operator.calledBefore({
        fail,
    });
    
    calledBefore(init, show);
    
    t.calledWith(fail, [`Expected function 'init' to be called before 'show' but 'show' not called at all`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: fn1 not called', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    show();
    
    const fail = stub();
    const calledAfter = operator.calledAfter({
        fail,
    });
    
    calledAfter(init, show);
    
    t.calledWith(fail, [`Expected function 'init' to be called after 'show' but 'init' not called at all`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: fn2 not called', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    
    const fail = stub();
    const calledAfter = operator.calledAfter({
        fail,
    });
    
    calledAfter(init, show);
    
    t.calledWith(fail, [`Expected function 'init' to be called after 'show' but 'show' not called at all`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: no name for fn1', (t) => {
    const init = stub();
    const show = stub();
    
    init();
    show();
    
    const fail = stub();
    const calledAfter = operator.calledAfter({
        fail,
    });
    
    calledAfter(init, show);
    
    t.calledWith(fail, [`Looks like you forget to define name of a stub, use: stub().withName('functionName')`]);
    t.end();
});

test('supertape: operator: stub: calledAfter: no name for fn2', (t) => {
    const init = stub().withName('init');
    const show = stub();
    
    init();
    show();
    
    const fail = stub();
    const calledAfter = operator.calledAfter({
        fail,
    });
    
    calledAfter(init, show);
    
    t.calledWith(fail, [`Looks like you forget to define name of a stub, use: stub().withName('functionName')`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: no name for fn1', (t) => {
    const init = stub();
    const show = stub();
    
    init();
    show();
    
    const fail = stub();
    const calledBefore = operator.calledBefore({
        fail,
    });
    
    calledBefore(init, show);
    
    t.calledWith(fail, [`Looks like you forget to define name of a stub, use: stub().withName('functionName')`]);
    t.end();
});

test('supertape: operator: stub: calledBefore: no name for fn2', (t) => {
    const init = stub().withName('init');
    const show = stub();
    
    init();
    show();
    
    const fail = stub();
    const calledBefore = operator.calledBefore({
        fail,
    });
    
    calledBefore(init, show);
    
    t.calledWith(fail, [`Looks like you forget to define name of a stub, use: stub().withName('functionName')`]);
    t.end();
});

test('supertape: operator: stub: calledInOrder', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    init();
    show();
    
    t.calledInOrder([init, show]);
    t.end();
});

test('supertape: operator: stub: calledInOrder: wrong order', (t) => {
    const init = stub().withName('init');
    const show = stub().withName('show');
    
    show();
    init();
    
    const fail = stub();
    const calledInOrder = operator.calledInOrder({
        fail,
    });
    
    calledInOrder([init, show]);
    
    t.calledWith(fail, [`should call 'init' before 'show'`]);
    t.end();
});

test('supertape: operator: stub: calledInOrder: not stub', (t) => {
    const init = () => {};
    const show = stub().withName('show');
    
    show();
    init();
    
    const fail = stub();
    const calledInOrder = operator.calledInOrder({
        fail,
    });
    
    calledInOrder([init, show]);
    
    t.calledWith(fail, [`Expected stub, but received: () => {}`]);
    t.end();
});

test('supertape: operator: stub: calledInOrder: not array', (t) => {
    const init = () => {};
    const show = stub().withName('show');
    
    show();
    init();
    
    const fail = stub();
    const calledInOrder = operator.calledInOrder({
        fail,
    });
    
    calledInOrder(init);
    
    t.calledWith(fail, [`Expected 'fns' to be 'array' but received: () => {}`]);
    t.end();
});
