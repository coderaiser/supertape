import {OperatorStub} from '@supertape/operator-stub';

import {
    stub,
    Stub,
} from '@cloudcmd/stub';

type Result = {
    is: boolean,
    expected: unknown,
    actual: unknown,
    message: string,
    output: string,
};

type Operators = {
    [operatorName: string]: (...args: any[]) => Result
};

type Test = Operators & OperatorStub & {
    equal: (result: unknown, expected: unknown, message?: string) => Result;
    notEqual: (result: unknown, expected: unknown, message?: string) => Result;
    deepEqual: (result: unknown, expected: unknown, message?: string) => Result;
    notDeepEqual: (result: unknown, expected: unknown, message?: string) => Result;
    fail: (message: string) => Result;
    pass: (message: string) => Result;
    ok: (result: boolean | unknown, message?: string) => Result;
    comment: (message: string) => Result;
    notOk: (result: boolean | unknown, message?: string) => Result;
    match: (result: string, pattern: string | RegExp, message?: string) => Result;
    notMatch: (result: string, pattern: string | RegExp, message?: string) => Result;
    end: () => void;
};

type TestOptions = {
    /**
     * Whether or not to skip the current (set of) test(s).
     * @default false
     * @since v1.0.0
     */
    skip?: boolean;

    /**
     * Whether or not to mark this (set of) test(s) as the only
     * test(s) run by the process.
     * @default false
     * @since v1.0.0
     */
    only?: boolean;

    /**
     * Custom extension operators to use in this (set of) test(s).
     * @default {}
     * @since v3.5.0
     */
    extensions?: CustomOperators;

    /**
     * Whether or not to not output results to `stdout`.
     * @default false
     * @since v3.8.0
     */
    quiet?: boolean;

    /**
     * Which output format to use for the test results.
     * @default 'tap'
     * @note When using the CLI, the default is `progress-bar`.
     * @since v3.8.1 (renamed from `formatter` added in v.3.8.0)
     */
    format?: string;

    /**
     * Whether or not to run this (set of) test(s).
     * @default true
     * @since v3.8.0
     */
    run?: boolean;

    /**
     * Whether or not to check test messages for duplicates.
     * By default, Supertape expects each message to be unique.
     * @default true // (`false` until v6.0.0)
     * @since v5.6.0
     */
    checkDuplicates?: boolean;

    /**
     * Whether or not to check the number of assertions per
     * test. By default, Supertape expects each test to have
     * only one assertion.
     * @default true
     * @since v6.8.0
     */
    checkAssertionsCount?: boolean;

    /**
     * Whether or not to check that test messages are scoped
     * (i.e. in the form `scope: message`). By default,
     * Supertape expects each test to be scoped.
     * @default true
     * @since v6.7.0
     */
    checkScopes?: boolean;
};

declare function test(message: string, fn: (t: Test) => void, options?: TestOptions): void;
declare namespace test {
    export var only: typeof test;
    export var skip: typeof test;
}

export default test;

type CustomOperators = {
    [operatorName: string]: (t: Test) => (...args: any[]) => Result
};

declare function extend(customOperator: CustomOperators): typeof test;

export {
    test,
    Test,
    stub,
    Stub,
    extend,
};

