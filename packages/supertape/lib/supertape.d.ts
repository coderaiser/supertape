import {
    Stub,
    stub,
} from '@supertape/operator-stub';

type Result = {
    is: boolean,
    expected: any,
    actual: any,
    message: string,
}

export type Test = Stub & {
    equal: (from: unknown, to: unknown, message?: string) => Result;
    notEqual: (from: unknown, to: unknown, message?: string) => Result;
    deepEqual: (from: unknown, to: unknown, message?: string) => Result;
    notDeepEqual: (from: unknown, to: unknown, message?: string) => Result;
    fail: (message: string) => Result;
    pass: (message: string) => Result;
    ok: (result: boolean | unknown, message?: string) => Result;
    comment: (message: string) => Result;
    notOk: (result: boolean | unknown, message?: string) => Result;
    match: (result: string, pattern: string | RegExp, message?: string) => Result;
    notMatch: (result: string, pattern: string | RegExp, message?: string) => Result;
    end: () => void;
}

declare function test(message: string, fn: (t: Test) => void): void;

export default test;

export {
    test,
    stub,
};

