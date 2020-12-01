import test from 'tape';
import stub from '@cloudcmd/stub';
import {createMockImport} from 'mock-import';

const {
    reImportDefault,
    mockImport,
    stopAll,
} = createMockImport(import.meta.url);

test('supertape: tape', async (t) => {
    const tape = stub();
    
    mockImport('tape', tape);
    const supertape = await reImportDefault('../lib/supertape.js');
    
    supertape('hello world', () => {
    });
    
    stopAll();
    
    t.ok(tape.calledWith('hello world', () => {}), 'should call tape');
    t.end();
});

test('supertape: tape: only', async (t) => {
    const tape = stub();
    tape.only = stub();
    
    mockImport('tape', tape);
    
    const test = await reImportDefault('..');
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
    
    mockImport('tape', tape);
    const test = await reImportDefault('..');
    const promise = async () => {
        throw Error('some error');
    };
    
    test.skip('hello world', promise);
    
    stopAll();
    
    t.ok(tape.skip.calledWith('hello world', () => {}), 'should call tape');
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
    
    mockImport('tape', tape);
    const test = await reImportDefault('..');
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
    
    mockImport('tape', tape);
    
    const test = await reImportDefault('..');
    const promise = async () => {};
    
    await test('hello world', promise);
    
    stopAll();
    
    t.notOk(end.called, 'should not call fail');
    t.end();
});

test('supertape: tape: equal', async (t) => {
    const equal = stub();
    const comment = stub();
    const tape = (str, fn) => {
        fn({
            equal,
            comment,
        });
    };
    
    mockImport('tape', tape);
    const supertape = await reImportDefault('..');
    
    await supertape('hello world', (t) => {
        t.equal(1, 2, 'should equal');
    });
    
    stopAll();
    
    t.ok(equal.calledWith(1, 2, 'should equal'), 'should call tape');
    t.end();
});

test('supertape: tape: deepEqual', async (t) => {
    const deepEqual = stub();
    const comment = stub();
    const tape = (str, fn) => {
        fn({
            deepEqual,
            comment,
        });
    };
    
    mockImport('tape', tape);
    const supertape = await reImportDefault('..');
    
    await supertape('hello world', (t) => {
        t.deepEqual(1, 2, 'should equal');
    });
    
    stopAll();
    
    t.ok(deepEqual.calledWith(1, 2, 'should equal'), 'should call tape');
    t.end();
});

test('supertape: tape: jsonEqual: diff', async (t) => {
    const deepEqual = stub();
    const fail = stub();
    const comment = stub();
    const tape = (str, fn) => {
        fn({
            comment,
            fail,
        });
    };
    
    mockImport('tape', tape);
    mockImport('deep-equal', deepEqual);
    const supertape = await reImportDefault('..');
    
    await supertape('hello world', (t) => {
        t.jsonEqual({}, {hello: 'world'}, 'should equal');
    });
    
    stopAll();
    
    t.ok(deepEqual.calledWith({}, {hello: 'world'}), 'should call tape');
    t.end();
});

test('supertape: tape: equal: no diff', async (t) => {
    const pass = stub();
    const fail = stub();
    const equal = stub();
    const comment = stub();
    const tape = (str, fn) => {
        fn({
            pass,
            fail,
            equal,
            comment,
        });
    };
    
    mockImport('tape', tape);
    const supertape = await reImportDefault('..');
    
    await supertape('hello world', (t) => {
        t.equal(1, 1, 'should equal');
    });
    
    stopAll();
    
    t.ok(equal.calledWith(1, 1, 'should equal'), 'should call equal');
    t.end();
});

test('supertape: tape: jsonEqual: diff: pass', async (t) => {
    const pass = stub();
    const comment = stub();
    const tape = (str, fn) => {
        fn({
            pass,
            comment,
        });
    };
    
    mockImport('tape', tape);
    const supertape = await reImportDefault('..');
    
    await supertape('hello world', (t) => {
        t.jsonEqual({hello: 'world'}, {hello: 'world'}, 'should equal');
    });
    
    stopAll();
    
    t.ok(pass.calledWith('should equal'), 'should call tape');
    t.end();
});

test('supertape: tape: jsonEqual: diff: comment', async (t) => {
    const jsonEqual = stub();
    const fail = stub();
    const comment = stub();
    const tape = (str, fn) => {
        fn({
            fail,
            comment,
            jsonEqual,
        });
    };
    
    mockImport('tape', tape);
    const supertape = await reImportDefault('..');
    
    await supertape('hello world', (t) => {
        t.jsonEqual({}, {hello: 'world'}, 'should equal');
    });
    
    stopAll();
    
    t.ok(comment.called, 'should call comment');
    t.end();
});

