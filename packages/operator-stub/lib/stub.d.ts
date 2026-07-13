import {Stub} from '@cloudcmd/stub';

type OperationResult = {
    is: boolean;
    expected: unknown;
    actual: unknown;
    message: string;
};
type AnyStub = Stub<any, any>;

export function stub(arg?: unknown): AnyStub;

export interface OperatorStub {
    called: (fn: AnyStub, message?: string) => OperationResult;
    notCalled: (fn: AnyStub, message?: string) => OperationResult;
    calledWith: <Args extends unknown[]>(fn: Stub<Args, any>, args: Args, message?: string) => OperationResult;
    calledWithNoArgs: (fn: AnyStub, message?: string) => OperationResult;
    calledCount: (fn: AnyStub, count: number, message?: string) => OperationResult;
    calledOnce: (fn: AnyStub, message?: string) => OperationResult;
    calledTwice: (fn: AnyStub, message?: string) => OperationResult;
    calledWithNew: (fn: AnyStub, message?: string) => OperationResult;
    calledBefore: (fn1: AnyStub, fn2: AnyStub, message?: string) => OperationResult;
    calledAfter: (fn1: AnyStub, fn2: AnyStub, message?: string) => OperationResult;
    calledInOrder: (fns: AnyStub[], message?: string) => OperationResult;
}
