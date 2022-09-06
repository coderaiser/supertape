import {OperatorStub} from '@supertape/operator-stub';

import {
    stub,
    Stub,
} from '@cloudcmd/stub';

type Result<R = unknown, E = unknown> = {
    is: boolean;
    message: string;
    output?: string;
    result?: R;
    expected?: E;
};

type EmptyOutput = {
    output: ''
};

/** The result of the `t.equal()` operators. */
type EqualResult<R, E> = Required<Result<R, E>>;

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
type OkResult<R, E> = Omit<Required<Result<R, E>>, 'output'>;

/** The result of the `t.match()` operators. */
type MatchResult = Omit<Required<Result<string, string | RegExp>>, 'output'>;

/** Assertions available in extension operators. */
type Operator = OperatorStub & {
    /**
     * Asserts that `result` and `expected` are strictly equal.
     *
     * @note uses `Object.is()`
     *
     * @param result The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     */
    equal: <R, E>(result: R, expected: E, message?: string) => EqualResult<R, E>;
    
    /**
     * Asserts that `result` and `expected` are not strictly equal.
     *
     * @note uses `!Object.is()`
     *
     * @param result The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     */
    notEqual: <R, E>(result: R, expected: E, message?: string) => EqualResult<R, E>;
    
    /**
     * Asserts that `result` and `expected` are loosely equal, with the same
     * structure and nested values.
     *
     * @note uses node's `deepEqual()` algorithm with strict comparisons
     * (`===`) on leaf nodes
     *
     * @param result The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     */
    deepEqual: <R, E>(result: R, expected: E, message?: string) => EqualResult<R, E>;
    
    /**
     * Asserts that `result` and `expected` are not loosely equal, with different
     * structure and/or nested values.
     *
     * @note uses node's `deepEqual()` algorithm with strict comparisons
     * (`===`) on leaf nodes
     *
     * @param result The resulting value to be tested.
     * @param expected The value to be tested against.
     * @param message An optional description of the assertion.
     */
    notDeepEqual: <R, E>(result: R, expected: E, message?: string) => EqualResult<R, E>;
    
    /**
     * Asserts that `result` is truthy.
     *
     * @param result The resulting value to be tested.
     */
    ok: <R>(result: boolean | R, message?: string) => OkResult<R, true>;
    
    /**
     * Asserts that `result` is falsy.
     *
     * @param result The resulting value to be tested.
     */
    notOk: <R>(result: boolean | R, message?: string) => OkResult<R | string, false>;
    
    /**
     * Generates a passing assertion.
     *
     * @param message An optional description of the assertion.
     */
    pass: (message?: string) => PassResult;
    
    /**
     * Generates a failing assertion.
     *
     * @param message A description of the assertion.
     */
    fail: (message: string) => FailResult<string>;
    
    /**
     * Declares the end of a test explicitly. `t.end()` must be
     * called once (and only once) per test, and no further
     * assertions are allowed.
     */
    end: () => void;
    
    /**
     * Asserts that `result` matches the regex `pattern`.
     *
     * @note if `pattern` is not a valid regex, the assertion fails.
     *
     * @param result The resulting value to be tested.
     * @param pattern A regex to be tested against.
     * @param message An optional description of the assertion.
     */
    match: (result: string, pattern: string | RegExp, message?: string) => MatchResult | FailResult;
    
    /**
     * Asserts that `result` does not match the regex `pattern`.
     *
     * @note if `pattern` is not a valid regex, the assertion always fails.
     *
     * @param result The resulting value to be tested.
     * @param pattern A regex to be tested against.
     * @param message An optional description of the assertion.
     */
    notMatch: (result: string, pattern: string | RegExp, message?: string) => MatchResult;
};

type CommentOperator = {
    /**
     * Prints a message without breaking the `tap` output.
     *
     * @param message The message to be printed.
     */
    comment: (message: string) => void;
};

/** Assertions available in tests. */
type Test = CommentOperator & {
    [operator in keyof Operator]: (...args: Parameters<Operator[operator]>) => void;
};

type FormatterTap = 'tap';
type FormatterFail = 'fail';
type FormatterProgressBar = 'progress-bar';
type FormatterJSONLines = 'json-lines';
type FormatterShort = 'short';

/** Built-in `tap` formatters for test outputs. */
type BuiltInFormatter = FormatterTap
    | FormatterFail
    | FormatterProgressBar
    | FormatterJSONLines
    | FormatterShort;

/** Options available per test. */
type TestOptions = {
    /**
     * Whether or not to skip this test case.
     * @default false
     */
    skip?: boolean;
    
    /**
     * Whether or not to mark this test case as the only one
     * run by the process.
     * @default false
     */
    only?: boolean;
    
    /**
     * Custom extension operators to use in this test case.
     * @default {}
     */
    extensions?: CustomOperators;
    
    /**
     * Whether or not to not report test results.
     * @default false
     */
    quiet?: boolean;
    
    /**
     * Which output format to use for the test results.
     * @default 'tap'
     * @note When using the CLI, the default is `progress-bar`.
     */
    format?: BuiltInFormatter;
    
    /**
     * Whether or not to run this test case.
     * @default true
     */
    run?: boolean;
    
    /**
     * Whether or not to check test messages for duplicates.
     * By default, Supertape expects each message to be unique.
     * @default true
     */
    checkDuplicates?: boolean;
    
    /**
     * Whether or not to check the number of assertions per
     * test case. By default, Supertape expects each test to
     * have only one assertion.
     * @default true
     */
    checkAssertionsCount?: boolean;
    
    /**
     * Whether or not to check that test messages are scoped
     * (i.e. in the form `'scope: message'`). By default,
     * Supertape expects each test case to be scoped.
     * @default true
     */
    checkScopes?: boolean;
};

/** Initializes Supertape with options for all tests. Overridden by `test(options)` on a per-test basis. */
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

/** Skips the given test case. */
declare const skip: typeof test;

/** Only runs the given test case. No other test cases are run. */
declare const only: typeof test;

// Map custom operators onto `Test`
type CustomTest<O extends CustomOperators> = Test & {
    [operator in keyof O]: (...args: Parameters<ReturnType<O[operator]>>) => void;
};

// `test()` with custom operators
type ExtendedTest<O extends CustomOperators> = (message: string, fn: (t: CustomTest<O>) => void, options?: TestOptions) => void;

/** Add custom extensions operators to tests. */
declare function extend<O extends CustomOperators>(extensions: O): ExtendedTest<O>;

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
