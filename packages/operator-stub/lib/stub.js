import {isStub} from '@cloudcmd/stub';

const isString = (a) => typeof a === 'string';
const getExpectedStubMessage = (fn) => `Expected stub, but received: ${fn.toString()}`;

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

