import {Stub} from '@cloudcmd/stub';

type Result = {
    is: boolean,
    expected: any,
    actual: any,
    message: string,
}
export function stub(arg?: unknown): Stub;

export interface OperatorStub {
    called: (fn: Stub, message?: string) => Result
    notCalled: (fn: Stub, message?: string) => Result
    calledWith: (fn: Stub, args: unknown[], message?: string) => Result;
    calledWithNoArgs: (fn: Stub, message?: string) => Result;
    calledCount: (fn: Stub, count: number, message?: string) => Result;
    calledOnce: (fn: Stub, message?: string) => Result;
    calledTwice: (fn: Stub, message?: string) => Result;
    calledWithNew: (fn: Stub, message?: string) => Result;
    calledBefore: (fn1: Stub, fn2: Stub, message?: string) => Result;
    calledAfter: (fn1: Stub, fn2: Stub, message?: string) => Result;
    calledInOrder: (fns: Stub[], message?: string) => Result;
}

