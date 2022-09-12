import {OperatorStub} from '@supertape/operator-stub';

import {
    stub,
    Stub,
} from '@cloudcmd/stub';

type OperationResult = {
    is: boolean,
    expected: unknown,
    result: unknown,
    message: string,
    output: string,
};

type Operator = {
    [index: string]: (...args: any[]) => OperationResult;
};

type Test = Operator & OperatorStub & {
    equal: (result: unknown, expected: unknown, message?: string) => OperationResult;
    notEqual: (result: unknown, expected: unknown, message?: string) => OperationResult;
    deepEqual: (result: unknown, expected: unknown, message?: string) => OperationResult;
    notDeepEqual: (result: unknown, expected: unknown, message?: string) => OperationResult;
    fail: (message: string) => OperationResult;
    pass: (message: string) => OperationResult;
    ok: (result: boolean | unknown, message?: string) => OperationResult;
    comment: (message: string) => OperationResult;
    notOk: (result: boolean | unknown, message?: string) => OperationResult;
    match: (result: string, pattern: string | RegExp, message?: string) => OperationResult;
    notMatch: (result: string, pattern: string | RegExp, message?: string) => OperationResult;
    end: () => void;
};

type TestOptions = {
    skip?: boolean;
    only?: boolean;
    extensions?: CustomOperator;
    quiet?: boolean;
    format?: string;
    run?: boolean;
    checkDuplicates?: boolean;
    checkAssertionsCount?: boolean;
    checkScopes?: boolean;
};

declare function test(message: string, fn: (t: Test) => void, options?: TestOptions): void;
declare namespace test {
    export var only: typeof test;
    export var skip: typeof test;
}

export default test;

type CustomOperator = {
    [index: string]: (operator: Operator) => (...args: any[]) => OperationResult
};

declare function extend(customOperator: CustomOperator): typeof test;

export {
    test,
    Test,
    stub,
    Stub,
    extend,
};

