export const called = (operator) => (fn, message = 'should be called') => {
    return operator.ok(fn.called, message);
};

export const notCalled = (operator) => (fn, message = 'should not be called') => {
    return operator.notOk(fn.called, message);
};

export const calledWith = (operator) => (fn, args, message = 'should be called with arguments') => {
    const [calledArgs] = fn.args;
    return operator.deepEqual(calledArgs, args, message);
};

export const calledCount = (operator) => (fn, count, message = 'should be called') => {
    return operator.equal(fn.callCount, count, message);
};

export const calledOnce = (operator) => (fn, count, message = 'should be called once') => {
    return operator.equal(fn.callCount, 1, message);
};

export const calledTwice = (operator) => (fn, count, message = 'should be called twice') => {
    return operator.equal(fn.callCount, 2, message);
};

export const calledWithNew = (operator) => (fn, message = 'should be called with new') => {
    return operator.ok(fn.calledWithNew(), message);
};
