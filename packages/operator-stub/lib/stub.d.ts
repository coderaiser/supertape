type Result = {
    is: boolean,
    expected: any,
    actual: any,
    message: string,
}

export interface Stub {
    called: (fn: Function, message?: string) => Result
    notCalled: (fn: Function, message?: string) => Result
    calledWith: (fn: Function, args: unknown[], message?: string) => Result;
    calledWithNoArgs: (fn: Function, message?: string) => Result;
    calledCount: (fn: Function, count: number, message?: string) => Result;
    calledOnce: (fn: Function, message?: string) => Result;
    calledTwice: (fn: Function, message?: string) => Result;
    calledWithNew: (fn: Function, message?: string) => Result;
}

export function stub(arg?: unknown): Function;
