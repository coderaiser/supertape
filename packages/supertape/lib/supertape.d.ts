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

type EmptyOutput = {output: ''};

/** The result of the `t.equal()` operators. */
type EqualResult<A, E> = Required<Result<A, E>>;

/** The result of the `t.pass()` operator. */
type PassResult = Pick<Result, 'message'> & EmptyOutput & {is: true};

/** The result of the `t.fail()` operator. */
type FailResult<M = Error> = EmptyOutput & {
    is: false;
    stack: Error['stack'];
    message: M;
    at: string;
};

/** The result of the `t.ok()` operators. */
type OkResult<A, E> = Omit<Required<Result<A, E>>, 'output'>;

/** The result of the `t.match()` operators. */
type MatchResult = Omit<Required<Result<string, string | RegExp>>, 'output'>;

/** Assertions available in extension operators. */
type Operator = OperatorStub & {
    /**
     * Asserts that `actual` and `expected` are strictly equal.
     * 
     * @note uses `Object.is()`
     * 
     * @param actual The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     * 
     * @since v1.0.2 (renamed from `equals` added in v1.0.0)
     */
    equal: <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    
    /**
     * Asserts that `actual` and `expected` are not strictly equal.
     * 
     * @note uses `!Object.is()`
     * 
     * @param actual The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     * 
     * @since v3.3.0
     */
    notEqual: <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    
    /**
     * Asserts that `actual` and `expected` are loosely equal, with the same
     * structure and nested values.
     * 
     * @note uses node's `deepEqual()` algorithm with strict comparisons
     * (`===`) on leaf nodes
     * 
     * @param actual The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     * 
     * @since v1.0.2 (renamed from `deepEquals` added in v1.0.0)
     */
    deepEqual: <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    
    /**
     * Asserts that `actual` and `expected` are not loosely equal, with different
     * structure and/or nested values.
     * 
     * @note uses node's `deepEqual()` algorithm with strict comparisons
     * (`===`) on leaf nodes
     * 
     * @param actual The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     * 
     * @since v3.3.0
     */
    notDeepEqual: <A, E>(actual: A, expected: E, message?: string) => EqualResult<A, E>;
    
    /**
     * Asserts that `actual` is truthy.
     * 
     * @param actual The resulting value to be tested.
     * 
     * @since v3.1.0
     */
    ok: <A>(actual: boolean | A, message?: string) => OkResult<A, true>;
    
    /**
     * Asserts that `actual` is falsy.
     * 
     * @param actual The resulting value to be tested.
     * 
     * @since v3.1.0
     */
    notOk: <A>(actual: boolean | A, message?: string) => OkResult<A | string, false>;
    
    /**
     * Generates a passing assertion.
     * 
     * @param message An optional description of the assertion.
     * 
     * @since v3.2.0
     */
    pass: (message?: string) => PassResult;
    
    /**
     * Generates a failing assertion.
     * 
     * @param message A description of the assertion.
     * @param at 
     * 
     * @since v3.1.0
     */
    fail: (message: string, at?: string) => FailResult<string>;
    
    /**
     * Declares the end of a test explicitly. `t.end()` must be
     * called once (and only once) per test, and no further
     * assertions are allowed.
     * 
     * @since v3.1.0
     */
    end: () => void;
    
    /**
     * Asserts that `actual` matches the regex `pattern`.
     * 
     * @note if `pattern` is not a valid regex, the assertion fails.
     * 
     * @param actual The resulting value to be tested.
     * @param pattern A regex to be tested against.
     * @param message An optional description of the assertion.
     * 
     * @since v5.1.0
     */
    match: (actual: string, pattern: string | RegExp, message?: string) => MatchResult | FailResult;
    
    /**
     * Asserts that `actual` does not match the regex `pattern`.
     * 
     * @note if `pattern` is not a valid regex, the assertion always fails.
     * 
     * @param actual The resulting value to be tested.
     * @param pattern A regex to be tested against.
     * @param message An optional description of the assertion.
     * 
     * @since v5.6.0
     */
    notMatch: (actual: string, pattern: string | RegExp, message?: string) => MatchResult;
};

type CommentOperator = {
    /**
     * Prints a message without breaking the `tap` output.
     * 
     * @param message The message to be printed.
     * 
     * @since v3.1.0
     */
    comment: (message: string) => void;
};

/** Assertions available in tests. */
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

/** Built-in `tap` formatters for test outputs. */
type BuiltInFormatter = FormatterTap | FormatterFail | FormatterProgressBar | FormatterJSONLines | FormatterShort;

/** Options available per test. */
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
     * Whether or not to not report test results.
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
     * (i.e. in the form `'scope: message'`). By default,
     * Supertape expects each test case to be scoped.
     * @default true
     * @since v6.7.0
     */
    checkScopes?: boolean;
};

/** Initializes Supertape with options for all tests. Overriden by `test(options)` on a per-test basis. @since v3.4.0 */
declare function init(options: TestOptions): void;

type CustomOperators = {
    [operatorName: string]: (t: Operator) => (...args: any[]) => Result | FailResult;
};

/**
 * Runs one test case. By default, Supertape expects each test
 * message to be scoped in the form `'scope: message'`, with
 * one assertion per test. Each test must finish with a call to
 * `t.end()`, and no further assertion(s) are allowed after it.
 * Settings in `options` take precedence over any setting set
 * elsewhere.
 */
declare function test(message: string, fn: (t: Test) => void, options?: TestOptions): void;

/** Skips the given test case. @since v1.0.0 */
declare const skip: typeof test;

/** Only runs the given test case. No other test cases are run. @since v1.0.0 */
declare const only: typeof test;

type CustomTest<O extends CustomOperators> = (
    message: string,
    fn: (t: Test & { [operator in keyof O]: (...args: Parameters<ReturnType<O[operator]>>) => void }) => void,
    options?: TestOptions,
) => void;

/** Add custom extensions operators to tests. @since v3.5.0 */
declare function extend<O extends CustomOperators>(extensions: O): CustomTest<O>;

declare namespace test {
    export {
        skip,
        only,
        extend,
        stub,
        test,
    };
}

export default test;

export {
    init,
    test,
    Test,
    TestOptions,
    stub,
    Stub,
    skip,
    only,
    extend,
    CustomOperators,
};
