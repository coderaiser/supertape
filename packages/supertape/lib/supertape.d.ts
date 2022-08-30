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
    equal: (actual: unknown, expected: unknown, message?: string) => Result;
    notEqual: (actual: unknown, expected: unknown, message?: string) => Result;
    deepEqual: (actual: unknown, expected: unknown, message?: string) => Result;
    notDeepEqual: (actual: unknown, expected: unknown, message?: string) => Result;
    fail: (message: string) => Result;
    pass: (message: string) => Result;
    ok: (actual: boolean | unknown, message?: string) => Result;
    comment: (message: string) => Result;
    notOk: (actual: boolean | unknown, message?: string) => Result;
    match: (actual: string, pattern: string | RegExp, message?: string) => Result;
    notMatch: (actual: string, pattern: string | RegExp, message?: string) => Result;
    end: () => void;
};

/** @since v3.8.0 */
type FormatterTap = 'tap';

/** @since v3.8.0 */
type FormatterFail = 'fail';

/** @since v3.9.0 */
type FormatterProgressBar = 'progress-bar';

/** @since v4.3.0 */
type FormatterJSONLines = 'json-lines';

/** @since v6.2.0 */
type FormatterShort = 'short';

type BuiltInFormatter = FormatterTap | FormatterFail | FormatterProgressBar | FormatterJSONLines | FormatterShort;

type TestOptions = {
    /**
     * Whether or not to skip this test case.
     * @default false
     * @since v1.0.0
     */
    skip?: boolean;

    /**
     * Whether or not to mark this test case as the only one
     * run by the process.
     * @default false
     * @since v1.0.0
     */
    only?: boolean;

    /**
     * Custom extension operators to use in this test case.
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
    format?: BuiltInFormatter;

    /**
     * Whether or not to run this test case.
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
     * test case. By default, Supertape expects each test to
     * have only one assertion.
     * @default true
     * @since v6.8.0
     */
    checkAssertionsCount?: boolean;

    /**
     * Whether or not to check that test messages are scoped
     * (i.e. in the form `scope: message`). By default,
     * Supertape expects each test case to be scoped.
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

