import {EventEmitter} from 'node:events';
import test, {stub} from 'supertape';
import {callWhenTestsEnds} from './index.js';

test('supertape: call-when-tests-ends', (t) => {
    const process = new EventEmitter();
    
    process.env = {
        hello: '1',
    };
    const isSkipTests = stub().returns(false);
    const isOnlyTests = stub().returns(false);
    const fn = stub();
    
    callWhenTestsEnds('hello', fn, {
        process,
        isSkipTests,
        isOnlyTests,
    });
    
    process.emit('exit');
    
    t.calledWithNoArgs(fn);
    t.end();
});

test('supertape: call-when-tests-ends: has only', (t) => {
    const process = new EventEmitter();
    
    process.env = {
        hello: '1',
    };
    const isSkipTests = stub().returns(false);
    const isOnlyTests = stub().returns(true);
    const fn = stub();
    
    callWhenTestsEnds('hello', fn, {
        process,
        isSkipTests,
        isOnlyTests,
    });
    
    process.emit('exit');
    
    t.notCalled(fn);
    t.end();
});

test('supertape: call-when-tests-ends: has skip', (t) => {
    const process = new EventEmitter();
    
    process.env = {
        hello: '1',
    };
    const isSkipTests = stub().returns(true);
    const isOnlyTests = stub().returns(false);
    const fn = stub();
    
    callWhenTestsEnds('hello', fn, {
        process,
        isSkipTests,
        isOnlyTests,
    });
    
    process.emit('exit');
    
    t.notCalled(fn);
    t.end();
});

test('supertape: call-when-tests-ends: no env', (t) => {
    const process = new EventEmitter();
    
    process.env = {};
    
    const isSkipTests = stub().returns(false);
    const isOnlyTests = stub().returns(false);
    const fn = stub();
    
    callWhenTestsEnds('hello', fn, {
        process,
        isSkipTests,
        isOnlyTests,
    });
    
    process.emit('exit');
    
    t.notCalled(fn);
    t.end();
});

test('supertape: call-when-tests-ends: return', (t) => {
    const process = new EventEmitter();
    
    process.env = {
        hello: '1',
    };
    
    const isSkipTests = stub().returns(false);
    const isOnlyTests = stub().returns(false);
    const fn = stub().returns(1);
    
    callWhenTestsEnds('hello', fn, {
        process,
        isSkipTests,
        isOnlyTests,
    });
    
    process.emit('exit');
    
    t.equal(process.exitCode, 1);
    t.end();
});

test('supertape: call-when-tests-ends: isFailTests', (t) => {
    const process = new EventEmitter();
    
    process.env = {
        hello: '1',
    };
    
    const isSkipTests = stub().returns(false);
    const isOnlyTests = stub().returns(false);
    const isFailTests = stub().returns(true);
    const fn = stub().returns(1);
    
    callWhenTestsEnds('hello', fn, {
        process,
        isSkipTests,
        isOnlyTests,
        isFailTests,
    });
    
    process.emit('exit');
    
    t.notCalled(fn);
    t.end();
});
