import {isStub} from '@cloudcmd/stub';

const isString = (a) => typeof a === 'string';
const getExpectedStubMessage = (fn) => `Expected stub, but received: ${fn?.toString()}`;

const {stringify} = JSON;
const {isArray} = Array;

export const called = (operator) => (fn) => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.fail(`'t.called' is too general, looks like you need 't.calledWith' or 't.calledWithNoArgs'`);
};

export const notCalled = (operator) => (fn, message = 'should not be called') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    if (!isString(message))
        return operator.fail(`'t.notCalled' expects message to be string, but received: '${stringify(message)}', looks like you need 't.notCalledWith'`);
    
    return operator.notOk(fn.called, message);
};

export const calledWith = (operator) => (fn, args, message = `should be called with 'args'`) => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    if (!fn.called)
        return operator.fail(`Expected function to be called with arguments, but not called at all`);
    
    if (!args)
        return operator.fail(`You haven't provided 'args', looks like you need 't.calledWithNoArgs()'`);
    
    if (!isArray(args))
        return operator.fail(`Expected 'args' to be 'array' but received: ${stringify(args)}`);
    
    const {length} = fn.args;
    const calledArgs = fn.args[length - 1];
    
    return operator.deepEqual(calledArgs, args, message);
};

export const calledWithNoArgs = (operator) => (fn, message = 'should be called with no arguments') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    if (!fn.called)
        return operator.fail('Expected function to be called with no arguments, but not called at all');
    
    if (!isString(message))
        return operator.fail(`'t.calledWithNoArgs' expects message to be string, but received: '${stringify(message)}', looks like you need 't.calledWith'`);
    
    const {length} = fn.args;
    const calledArgs = fn.args[length - 1];
    
    return operator.deepEqual(calledArgs, [], message);
};

export const calledCount = (operator) => (fn, count, message = 'should be called') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.equal(fn.callCount, count, message);
};

export const calledOnce = (operator) => (fn, message = 'should be called once') => calledCount(operator)(fn, 1, message);

export const calledTwice = (operator) => (fn, count, message = 'should be called twice') => calledCount(operator)(fn, 2, message);

export const calledWithNew = (operator) => (fn, message = 'should be called with new') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.ok(fn.calledWithNew(), message);
};

const noName = ({name}) => name === 'anonymous';

export const calledBefore = (operator) => (fn1, fn2, message) => {
    message = message || `should call '${fn1.name}' before '${fn2.name}'`;
    
    if (!isStub(fn1))
        return operator.fail(getExpectedStubMessage(fn1));
    
    if (!isStub(fn2))
        return operator.fail(getExpectedStubMessage(fn2));
    
    if (noName(fn1) || noName(fn2))
        return operator.fail(`Looks like you forget to define name of a stub, use: stub().withName('functionName')`);
    
    if (!fn1.called)
        return operator.fail(`Expected function '${fn1.name}' to be called before '${fn2.name}' but '${fn1.name}' not called at all`);
    
    if (!fn2.called)
        return operator.fail(`Expected function '${fn1.name}' to be called before '${fn2.name}' but '${fn2.name}' not called at all`);
    
    return operator.ok(fn1.calledBefore(fn2), message);
};

export const calledAfter = (operator) => (fn1, fn2, message) => {
    message = message || `should call '${fn1.name}' after '${fn2.name}'`;
    
    if (!isStub(fn1))
        return operator.fail(getExpectedStubMessage(fn1));
    
    if (!isStub(fn2))
        return operator.fail(getExpectedStubMessage(fn2));
    
    if (noName(fn1) || noName(fn2))
        return operator.fail(`Looks like you forget to define name of a stub, use: stub().withName('functionName')`);
    
    if (!fn1.called)
        return operator.fail(`Expected function '${fn1.name}' to be called after '${fn2.name}' but '${fn1.name}' not called at all`);
    
    if (!fn2.called)
        return operator.fail(`Expected function '${fn1.name}' to be called after '${fn2.name}' but '${fn2.name}' not called at all`);
    
    return operator.ok(fn1.calledAfter(fn2), message);
};

export const calledInOrder = (operator) => (fns, message = 'should call in order') => {
    if (!isArray(fns))
        return operator.fail(`Expected 'fns' to be 'array' but received: ${fns}`);
    
    let failMessage = '';
    const fail = (message) => failMessage = message;
    const ok = (result, message) => {
        if (!result)
            failMessage = message;
    };
    
    const check = calledBefore({
        fail,
        ok,
    });
    
    for (let i = 0; i < fns.length - 1; i++) {
        const fn1 = fns[i];
        const fn2 = fns[i + 1];
        
        check(fn1, fn2);
        
        if (failMessage)
            return operator.fail(failMessage);
    }
    
    return operator.pass(message);
};

