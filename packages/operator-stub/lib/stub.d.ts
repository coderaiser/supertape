import {Stub} from '@cloudcmd/stub';

type OperationResult = {
    is: boolean;
    expected: unknown;
    actual: unknown;
    message: string;
};

export function stub(arg?: unknown): Stub;
export interface OperatorStub {
    called: (fn: Stub, message?: string) => OperationResult;
    notCalled: (fn: Stub, message?: string) => OperationResult;
    calledWith: (fn: Stub, args: unknown[], message?: string) => OperationResult;
    calledWithNoArgs: (fn: Stub, message?: string) => OperationResult;
    calledCount: (fn: Stub, count: number, message?: string) => OperationResult;
    calledOnce: (fn: Stub, message?: string) => OperationResult;
    calledTwice: (fn: Stub, message?: string) => OperationResult;
    calledWithNew: (fn: Stub, message?: string) => OperationResult;
    calledBefore: (fn1: Stub, fn2: Stub, message?: string) => OperationResult;
    calledAfter: (fn1: Stub, fn2: Stub, message?: string) => OperationResult;
    calledInOrder: (fns: Stub[], message?: string) => OperationResult;
}
