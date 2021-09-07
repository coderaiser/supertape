import {OperatorStub} from '@supertape/operator-stub';

import {
    stub,
    Stub,
} from '@cloudcmd/stub';

type Result = {
    is: boolean,
    expected: any,
    actual: any,
    message: string,
}

type Test = OperatorStub & {
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
declare namespace test {
    export var only: typeof test;
    export var skip: typeof test;
}

export default test;

export {
    test,
    Test,
    stub,
    Stub,
};

