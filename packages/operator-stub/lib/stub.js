import {isStub} from '@cloudcmd/stub';
const {stringify} = JSON;

const getExpectedStubMessage = (fn) => `Expected stub, but received ${fn.toString()}`;

export const called = (operator) => (fn) => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.fail(`'t.called' is to general, looks like you need 't.calledWith' or 't.calledWithNoArgs'`);
};

export const notCalled = (operator) => (fn, message = 'should not be called') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.notOk(fn.called, message);
};

export const calledWith = (operator) => (fn, args, message = 'should be called with arguments') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    if (!fn.called)
        return operator.fail(`Expected function to be called with arguments '${stringify(args)}', but not called at all`);
    
    if (!args)
        return operator.fail(`You haven't provided 'arguments', looks like you need 't.calledWithNoArgs()'`);
    
    const {length} = fn.args;
    const calledArgs = fn.args[length - 1];
    
    return operator.deepEqual(calledArgs, args, message);
};

export const calledWithNoArgs = (operator) => (fn, message = 'should be called with no arguments') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    if (!fn.called)
        return operator.fail('Expected function to be called with no arguments, but not called at all');
    
    const {length} = fn.args;
    const calledArgs = fn.args[length - 1];
    
    return operator.deepEqual(calledArgs, [], message);
};

export const calledCount = (operator) => (fn, count, message = 'should be called') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.equal(fn.callCount, count, message);
};

export const calledOnce = (operator) => (fn, message = 'should be called once') => {
    return calledCount(operator)(fn, 1, message);
};

export const calledTwice = (operator) => (fn, count, message = 'should be called twice') => {
    return calledCount(operator)(fn, 2, message);
};

export const calledWithNew = (operator) => (fn, message = 'should be called with new') => {
    if (!isStub(fn))
        return operator.fail(getExpectedStubMessage(fn));
    
    return operator.ok(fn.calledWithNew(), message);
};

