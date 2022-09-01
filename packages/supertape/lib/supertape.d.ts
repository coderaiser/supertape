import {OperatorStub} from '@supertape/operator-stub';

import {
    stub,
    Stub,
} from '@cloudcmd/stub';

type Result<A = unknown, E = unknown> = {
    is: boolean;
    message: string;
    output?: string;
    actual?: A;
    expected?: E;
};

type EmptyOutput = {
    output: '';
};

type EqualResult<A, E> = Required<Result<A, E>>;

type PassResult = Pick<Result, "message"> & EmptyOutput & { is: true };

type FailResult<M = Error> = EmptyOutput & {
    is: false;
    stack: Error["stack"];
    message: M;
    at: string;
};

type OkResult<A, E> = Omit<Required<Result<A, E>>, "output">;

type MatchResult = Omit<Required<Result<string, string | RegExp>>, "output">;

type Operator = OperatorStub & {
    equal:        <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    notEqual:     <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    deepEqual:    <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    notDeepEqual: <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    ok:              <A>(actual: boolean | A, message?: string) => OkResult<A, true>;
    notOk:           <A>(actual: boolean | A, message?: string) => OkResult<A | string, false>;
    pass:               (message: string) => PassResult;
    fail:               (message: string, at?: string) => FailResult<string>;
    end:                () => void;
    match:              (actual: string, pattern: string | RegExp, message?: string) => MatchResult | FailResult;
    notMatch:           (actual: string, pattern: string | RegExp, message?: string) => MatchResult;
};

type CommentOperator = {
    comment: (message: string) => void;
};

type Test = CommentOperator & {
    [operator in keyof Operator]: (...args: Parameters<Operator[operator]>) => void;
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

type CustomOperators = {
    [operatorName: string]: (t: Operator) => (...args: any[]) => Result | FailResult;
};

declare function test(message: string, fn: (t: Test) => void, options?: TestOptions): void;

declare function extend(customOperator: CustomOperators): typeof test;
type _extend = typeof extend;

declare namespace test {
    export const only: typeof test;
    export const skip: typeof test;
    export const extend: _extend;
}

export default test;

export {
    test,
    Test,
    stub,
    Stub,
    extend,
};

