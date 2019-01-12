'use strict';

const test = require('tape');
const stub = require('@cloudcmd/stub');
const mockRequire = require('mock-require');
const {
    reRequire,
    stopAll,
} = mockRequire;

test('supertape: tape', async (t) => {
    const tape = stub();
    
    mockRequire('tape', tape);
    const supertape = reRequire('..');
    
    supertape('hello world', () => {
    });
    
    stopAll();
    
    t.ok(tape.calledWith('hello world', () => {}), 'should call tape');
    t.end();
});

test('supertape: tape: only', async (t) => {
    const tape = stub();
    tape.only = stub();
    
    mockRequire('tape', tape);
    
    const test = reRequire('..');
    const promise = async () => {
        throw Error('some error');
    };
    
    test.only('hello world', promise);
    
    stopAll();
    
    t.ok(tape.only.calledWith('hello world', () => {}), 'should call tape');
    t.end();
});

test('supertape: tape: skip', async (t) => {
    const tape = stub();
    tape.skip = stub();
    
    mockRequire('tape', tape);
    const test = reRequire('..');
    const promise = async () => {
        throw Error('some error');
    };
    
    test.skip('hello world', promise);
    
    stopAll();
    
    t.ok(tape.skip.calledWith('hello world', () => {}), 'should call tape');
    t.end();
});

test('supertape: tape: rejects: fail', async (t) => {
    const fail = stub();
    const end = stub();
    const tape = async (msg, promise) => {
        const t = {
            fail,
            end,
        };
        
        await promise(t);
    };
    
    mockRequire('tape', tape);
    
    const test = reRequire('..');
    
    const promise = async () => {
        throw Error('some error');
    };
    
    await test('hello world', promise);
    
    stopAll();
    
    t.ok(fail.calledWith('some error'), 'should call fail');
    t.end();
});

test('supertape: tape: rejects: end', async (t) => {
    const fail = stub();
    const end = stub();
    const tape = async (msg, promise) => {
        const t = {
            fail,
            end,
        };
        
        await promise(t);
    };
    
    mockRequire('tape', tape);
    const test = reRequire('..');
    const promise = async () => {
        throw Error('some error');
    };
    
    await test('hello world', promise);
    
    stopAll();
    
    t.ok(end.calledWith(), 'should call end');
    t.end();
});

test('supertape: tape: resolves: fail', async (t) => {
    const fail = stub();
    const end = stub();
    const tape = async (msg, promise) => {
        const t = {
            fail,
            end,
        };
        
        await promise(t);
    };
    
    mockRequire('tape', tape);
    const test = reRequire('..');
    const promise = async () => {};
    
    await test('hello world', promise);
    
    t.notOk(fail.called, 'should not call fail');
    t.end();
});

test('supertape: tape: resolves: end', async (t) => {
    const fail = stub();
    const end = stub();
    const tape = async (msg, promise) => {
        const t = {
            fail,
            end,
        };
        
        await promise(t);
    };
    
    mockRequire('tape', tape);
    
    const test = reRequire('..');
    const promise = async () => {};
    
    await test('hello world', promise);
    
    stopAll();
    
    t.notOk(end.called, 'should not call fail');
    t.end();
});

test('supertape: tape: equals', async (t) => {
    const equals = stub();
    const tape = (str, fn) => {
        fn({
            equals,
        });
    };
    
    mockRequire('tape', tape);
    const supertape = reRequire('..');
    
    await supertape('hello world', (t) => {
        t.equals(1, 2, 'should equal');
    });
    
    stopAll();
    
    t.ok(equals.calledWith(1, 2, 'should equal'), 'should call tape');
    t.end();
});

test('supertape: tape: deepEquals: diff', async (t) => {
    const deepEquals = stub();
    const tape = (str, fn) => {
        fn({
            deepEquals,
        });
    };
    
    mockRequire('tape', tape);
    const supertape = reRequire('..');
    
    await supertape('hello world', (t) => {
        t.deepEquals({}, {hello: 'world'}, 'should equal');
    });
    
    stopAll();
    
    t.ok(deepEquals.calledWith({}, {hello: 'world'}, 'should equal'), 'should call tape');
    t.end();
});

