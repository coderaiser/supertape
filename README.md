# 📼 Supertape [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL] [![License: MIT][MITLicenseIMGURL]][MITLicenseURL]

[NPMURL]: https://npmjs.org/package/supertape "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusURL]: https://github.com/coderaiser/supertape/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/supertape/workflows/Node%20CI/badge.svg
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github
[MITLicenseURL]: https://opensource.org/licenses/MIT
[MITLicenseIMGURL]: https://img.shields.io/badge/License-MIT-green.svg

[![supertape](https://asciinema.org/a/Cgc3rDOfZAeDnJSxzEYpPfBMY.svg)](https://asciinema.org/a/Cgc3rDOfZAeDnJSxzEYpPfBMY)

[**Tape**](https://github.com/substack/tape)-inspired [`TAP`](https://testanything.org/)-compatible simplest high speed test runner with superpowers.

📼 **Supertape** is a fast, minimal test runner with the soul of **tape**. It's designed to be as compatible as possible with **tape** while still having some key improvements, such as:

- out-of-the-box [EcmaScript Modules](https://nodejs.org/api/esm.html) support (take a look at [mock-import](https://github.com/coderaiser/mock-import) for mocking and 🎩[ESCover](https://github.com/coderaiser/escover) for coverage)
- a number of [built-in pretty output formatters](#formatting)
- easy [configuration](#list-of-options)
- the ability to [extend](#extending)
- showing colored diff when using the [`t.equal()`](#tequalresult-any-expected-any-message-string) and [`t.deepEqual()`](#tdeepequalresult-any-expected-any-message-string) assertion operators
- detailed stack traces for `async` functions
- multiple [`test.only`s](#testonlymessage-string-fn-t-test--void-options-testoptions)
- [smart timeouts](#supertape_timeout) for long running tests 🏃‍♂️
- more natural assertions: `expected, result` -> `result, expected`:

  ```js
  t.equal(error.message, 'hello world', `expected error.message to be 'hello world'`);
  ```

📼 **Supertape** doesn't contain:

- assertion aliases, making the available operators far more concise
- `ES3 code` and lots of [ponyfills](https://github.com/sindresorhus/ponyfill#how-are-ponyfills-better-than-polyfills)
- `t.throws()`, `t.doesNotThrow()` - use [**tryCatch**](https://github.com/coderaiser/try-catch) or [**tryToCatch**](https://github.com/coderaiser/try-to-catch) with [`t.equal()`](#tequalresult-any-expected-any-message-string) instead
- [`t.plan()`](https://github.com/substack/tape#tplann)

For a list of all built-in assertions, see [Operators](#operators).

## Installation

```plain
npm i supertape -D
```

## Example

```js
// test.js
const test = require('supertape');

test('hello: world', (t) => {
    t.pass('hello, world!');
    t.end();
});
```

Output:

```plain
$ npx supertape test.js
TAP version 13

1..1
# tests 1
# pass 1

# ✅ ok
```

## Usage and Configuration

Tests can be run either through the `supertape` CLI (or optionally through `node`/`ts-node`). [Options](#list-of-options) can be specified via the command line, through environment variables, or in individual test files.

### Command Line

📼 **Supertape** provides a CLI that supports running both `CJS` and `ESM` tests:

```sh
$ [npx] supertape [options] [path/glob]
```

If a glob is specified instead of a single file path (e.g. `tests/*.js`), all of the test results are outputted together.

#### Command Line Flags:

#### `--help` (alias: `-h`)

Displays a help prompt with usage information and exits:

```plain
Usage: supertape [options] [path]
Options
   -h, --help                  display this help and exit
   -v, --version               output version information and exit
   -f, --format                use a specific output format - default: progress-bar/tap on CI
   -r, --require               require module
   --no-check-scopes           do not check that messages contains scope: 'scope: message'
   --no-check-assertions-count do not check that assertion count is no more then 1
   --no-check-duplicates       do not check messages for duplicates
```

#### `--version` (alias: `-v`)

Outputs version information and exits.

#### `--format [format]` (alias: `-f`)

Sets a specific [format](#formatting) for outputting test results. When using the CLI, this option must be set to change the format used. Defaults to `progress-bar`.

#### `--require [module]` (alias: `-r`)

Loads a given module before running all tests. Can be used to perform [JIT transpilation](https://github.com/substack/tape#preloading-modules).

#### `--no-check-duplicates`

Tells 📼 **Supertape** not to check test messages for duplicates. By default, messages are expected to be unique. (See: [Duplicate Test Messages](#duplicate-test-messages))

#### `--no-check-assertions-count`

Tells 📼 **Supertape** not to check the number of assertions per test. By default, only one assertion is allowed. (See: [Assertions Per Test](#assertions-per-test))

#### `--no-check-scopes`

Tells 📼 **Supertape** not to check test messages for proper scoping (i.e. in the form `'scope: message'`). By default, messages are expected to be scoped. (See: [Test Message Scoping](#test-message-scoping))

### Environment Variables

The 📼 **Supertape** CLI also supports setting some options through environment variables:

```sh
$ SUPERTAPE_TIMEOUT=5000 supertape tests/*.js
```

Certain options, such as [`SUPERTAPE_TIMEOUT`](#supertape_timeout) can only be set in this way.

#### Environment Variable Only Options:

#### `SUPERTAPE_TIMEOUT`

Controls the time (in milliseconds) that a test is allowed to run for before timing out. By default, tests time out after 3 seconds (or `3000` ms).

#### `SUPERTAPE_CHECK_SKIPED`

If specified, tells 📼 **Supertape** to check the number of skipped test files. Exits with status code [`SKIPED`](#-exit-codes).

*Note: yes, `skiped` is a typo.*

#### `SUPERTAPE_PROGRESS_BAR_COLOR`

If using the `progress-bar` formatter, sets the color of the progress bar itself. Can either be a hex color or a valid [**chalk**](https://github.com/chalk/chalk#colors) color. Defaults to ![#f9d472](https://via.placeholder.com/15/f9d472/f9d472.png) `#f9d472`.

#### `SUPERTAPE_PROGRESS_BAR_MIN`

If using the `progress-bar` formatter, sets the minimum number of tests to run before showing the progress bar. Defaults to `100`. Set to `0` to always show.

#### `SUPERTAPE_PROGRESS_BAR_STACK`

If using the `progress-bar` formatter, sets a flag to show or hide the error stack when an assertion fails. Defaults to `1` *(show)*. Set to `0` to hide.

#### Other Options:

#### `SUPERTAPE_CHECK_DUPLICATES`

Set to `0` to tell 📼 **Supertape** not to check test messages for duplicates. By default, messages are expected to be unique. (See: [Duplicate Test Messages](#duplicate-test-messages))

#### `SUPERTAPE_CHECK_ASSERTIONS_COUNT`

Set to `0` to tell 📼 **Supertape** not to check the number of assertions per test. By default, only one assertion is allowed. (See: [Assertions Per Test](#assertions-per-test))

#### `SUPERTAPE_CHECK_SCOPES`

Set to `0` to tell 📼 **Supertape** not to check test messages for proper scoping (i.e. in the form `'scope: message'`). By default, messages are expected to be scoped. (See: [Test Message Scoping](#test-message-scoping))

### `node` and `ts-node`

While the preferred way to use 📼 **Supertape** is via the CLI, any test file (`.js` or `.ts`) requiring/importing 📼 **Supertape** can be invoked through `node` or `ts-node`, respectively:

```js
// test.js or test.ts
import test from 'supertape';

test('test: from (ts-)node', (t) => {
    t.pass('hello, world!');
    t.end();
});
```

```bash
$ node test.js
# OR
$ ts-node test.ts
```

### Formatting

#### Built-In Formatters

📼 **Supertape** provides a few different output formats beyond the regular `TAP` format. When using the [`supertape` CLI](#command-line), the `progress-bar` formatter is used by default. In all other cases, the default is the `tap` format.

The format used can be changed with:

- the [`--format [format]`](#--format-format-alias--f) command line flag
- the [`options.format`](#format-string) option passed to a test

While each formatter is maintained in a separate package, they are included when downloading 📼 **Supertape**. The following is a list of such packages:

|Package|Version|
|-------|-------|
| [`@supertape/formatter-tap`](/packages/formatter-tap)                   | [![npm][FTapNPMBadge]][FTapNPMLink]     |
| [`@supertape/formatter-fail`](/packages/formatter-fail)                 | [![npm][FFailNPMBadge]][FFailNPMLink]   |
| [`@supertape/formatter-progress-bar`](/packages/formatter-progress-bar) | [![npm][FProgNPMBadge]][FProgNPMLink]   |
| [`@supertape/formatter-json-lines`](/packages/formatter-json-lines)     | [![npm][FJsonNPMBadge]][FJsonNPMLink]   |
| [`@supertape/formatter-short`](/packages/formatter-short)               | [![npm][FShortNPMBadge]][FShortNPMLink] |

[FTapNPMBadge]: https://img.shields.io/npm/v/@supertape/formatter-tap.svg?maxAge=86400
[FTapNPMLink]: https://www.npmjs.com/package/@supertape/formatter-tap
[FFailNPMBadge]: https://img.shields.io/npm/v/@supertape/formatter-fail.svg?maxAge=86400
[FFailNPMLink]: https://www.npmjs.com/package/@supertape/formatter-fail
[FProgNPMBadge]: https://img.shields.io/npm/v/@supertape/formatter-progress-bar.svg?maxAge=86400
[FProgNPMLink]: https://www.npmjs.com/package/@supertape/formatter-progress-bar
[FJsonNPMBadge]: https://img.shields.io/npm/v/@supertape/formatter-json-lines.svg?maxAge=86400
[FJsonNPMLink]: https://www.npmjs.com/package/@supertape/formatter-json-lines
[FShortNPMBadge]: https://img.shields.io/npm/v/@supertape/formatter-short.svg?maxAge=86400
[FShortNPMLink]: https://www.npmjs.com/package/@supertape/formatter-short

#### Using Other `TAP` Reporters

If you'd like to use another output format instead of the built-in formatters, such as [**`tap-min`**](https://www.npmjs.com/package/tap-min), use the `format: 'tap'` option and pipe the output to the reporter of your choice:

```bash
$ supertape tests/*.js -f tap | tap-min
```

### Extending

📼 **Supertape** maintains a minimal number of core assertion operators, leaving out aliases and things like `t.throws()`. Custom extension operators can either be added through the [`test.extend(extensions)`](#testextendextensions) function.

The `extend()` function takes a dictionary of functions that each take an object of built-in operators as input, and return an operator function with any number of arguments. The return value of the `extend()` function is a `test` object with the custom operators added to it. For example, adding a `transform` operator:

```js
const {extend} = require('supertape');

const test = extend({
    transform: (t) => (a, b, message = 'should transform') => {
        const {is, output} = t.equal(a + 1, b - 1);
        return {
            is,
            output,
            message,
        };
    },
});

test('test: transform', (t) => {
    t.transform(1, 3);
    t.end();
});
```

Extension operators can also be included in the [`options.extensions`](#extensions-customoperator) object in calls to `test()`.

## List of Options

Individual tests can take an optional `options` parameter for setting configuration values:

```js
const test = require('supertape');

test('no scope', (t) => {
    t.pass('this test has two assertions');
    t.pass('this test has no message scope');
    t.end();
}, {
    checkAssertionsCount: false,
    checkScopes: false,
});
```

Instead of setting the same options multiple times, a custom wrapper can be used that sets common options:

```js
// _supertape.js
import {test as _test} from 'supertape';

export const test = (message, fn) => _test(message, fn, {
    checkAssertionsCount: false,
});
```

```js
// test.js
import test from '_supertape';

test('test: wrapper', (t) => {
    t.pass('using a wrapper');
    t.pass('with two assetions');
    t.end();
});
```

### Options

#### `skip: boolean`

Whether or not to skip a test. Defaults to `false`.

#### `only: boolean`

Whether or not to mark a test as the only one run by the process. Defaults to `false`.

#### `extensions: CustomOperator`

Custom extension operators to use in tests. Defaults to `{}`. (See: [Extending](#extending))

#### `quiet: boolean`

Whether or not to not report test results. Defaults to `false`.

#### `format: string`

Which output format to use for the test results. The [built-in `tap` formatters](#formatting) are `tap`, `fail`, `progress-bar`, `json-lines`, and `short`. Defaults to `tap`.

When using the CLI, the default formatter is `progress-bar`. This can only be overridden using the `--format [format]` flag.

#### `run: boolean`

Whether or not to run a test. Defaults to `true`.

#### `checkDuplicates: boolean`

Whether or not to check test messages for duplicates. 📼 **Supertape** expects each message to be unique. Defaults to `true`. (See: [Duplicate Test Messages](#duplicate-test-messages))

#### `checkAssertionsCount: boolean`

Whether or not to check the number of assertions per test. 📼 **Supertape** expects each test to have only one assertion. Defaults to `true`. (See: [Assertions Per Test](#assertions-per-test))

#### `checkScopes: boolean`

Whether or not to check that test messages are scoped (i.e. in the form `'scope: message'`). 📼 **Supertape** expects each test message to be scoped. (See: [Test Message Scoping](#test-message-scoping))

## Validation

📼 **Supertape** has a number of built-in validation checks to ensure that your tests are of the highest possible quality. A test will fail if it does not pass these checks. Certain checks can be disabled. (See: [Configuration](#usage-and-configuration))

### Single Call to `t.end()`

Each test must call the [`t.end()`](#tend) operator to denote that it has finished. Only one call to `t.end()` is allowed, and no assertions are allowed after it.

This check cannot be disabled. In addition, 🐊 **Putout** has a rule 🐊 [`remove-useless-t-end`][PutoutTEnd] for ensuring it is only called once. (See: [Putout](#-putout))

[PutoutTEnd]: https://github.com/coderaiser/putout/blob/master/packages/plugin-tape/README.md#remove-useless-t-end

#### ❌ Example of Incorrect Code:

```js
test('hello: world', (t) => {
    t.end();
    t.end();
    t.pass('hello, world!');
});
```

#### ✅ Example of Correct Code:

```js
test('hello: world', (t) => {
    t.pass('hello, world!');
    t.end();
});
```

### Duplicate Test Messages

📼 **Supertape** expects all test messages to be unique. This check can be disabled with:

- the [`--no-check-duplicates`](#--no-check-duplicates) command line flag
- the [`SUPERTAPE_CHECK_DUPLICATES`](#supertape_check_duplicates) environment variable (set to `0`)
- the [`checkDuplicates`](#checkduplicates-boolean) test option (set to `true`)

#### ❌ Example of Incorrect Code:

```js
test('hello: world', (t) => {
    t.pass('hello one!');
    t.end();
});

test('hello: world', (t) => {
    t.pass('hello two!');
    t.end();
});
```

### Assertions Per Test

📼 **Supertape** expects that each test contains exactly one assertion. This check can be disabled with:

- the [`--no-check-assertions-count`](#--no-check-assertions-count) command line flag
- the [`SUPERTAPE_CHECK_ASSERTIONS_COUNT`](#supertape_check_assertions_count) environment variable (set to `0`)
- the [`checkAssertionsCount`](#checkassertionscount-boolean) test option (set to `true`)

#### ❌ Example of Incorrect Code:

```js
test('test: no assertion', (t) => {
    t.end();
});

test('test: more than one assertion', (t) => {
    t.equal(1, 1);
    t.equal(2, 2);
    t.end();
});
```

#### ✅ Example of Correct Code:

```js
test('test: one', (t) => {
    t.equal(1, 1);
    t.end();
});

test('test: two', (t) => {
    t.equal(2, 2);
    t.end();
});
```

### Test Message Scoping

📼 **Supertape** expects that each test message be scoped in the form `'scope: message'`. This check can be disabled with:

- the [`--no-check-scopes`](#--no-check-scopes) command line flag
- the [`SUPERTAPE_CHECK_SCOPES`](#supertape_check_scopes) environment variable (set to `0`)
- the [`checkScopes`](#checkscopes-boolean) test option (set to `true`)

#### ❌ Example of Incorrect Code:

```js
test('test no scope', (t) => {
    t.pass('hello, world!');
    t.end();
});
```

#### ✅ Example of Correct Code:

```js
test('test: scope', (t) => {
    t.pass('hello, world!');
    t.end();
});
```

## API

#### `test(message: string, fn: (t: Test) => void, options?: TestOptions)`

The core test function. Generates a new test with a [scoped `message`](#test-message-scoping). The test object `t` provides all [built-in assertion operators](#operators) as well as any [extension operators](#extending) that have been added. Tests execute serially. By default, 📼 **Supertape** expects each test to have a [unique message](#duplicate-test-messages) and a [single assertion](#assertions-per-test):

```js
const test = require('supertape');

test('hello: world', (t) => {
    t.pass('hello, world!');
    t.end();
});
```

[Options](#list-of-options) can be specified on a per-test basis as well.

#### `test.skip(message: string, fn: (t: Test) => void, options?: TestOptions)`

Generates a new test that will be skipped over by setting [`options.skip`](#skip-boolean) to `true`.

#### `test.only(message: string, fn: (t: Test) => void, options?: TestOptions)`

Generates a new test that will be the only test run for the entire process, ignoring all other tests, by setting [`options.only`](#only-boolean) to `true`.

#### `test.extend(extensions: CustomOperators)`

Generates a new test function that includes the specified custom extension operators. For more information, see [Extending](#extending).

## Operators

The assertion operators of 📼 **Supertape** are heavily influenced by [**tape**](https://github.com/substack/tape). However, to keep a minimal core of assertions, there are no aliases and some superfluous operators have been removed (such as `t.throws()`).

The following is a list of the base methods maintained by 📼 **Supertape**. Other built-in operators, such as assertions for stubbing, are maintained in [separate packages](#other-built-in-operators). To add custom assertion operators, see [Extending](#extending).

### Core Operators

#### `t.equal(result: any, expected: any, message?: string)`

Asserts that `result` and `expected` are strictly equal. If `message` is provided, it will be outputted as a description of the assertion.

*Note: uses `Object.is(result, expected)`*

#### `t.notEqual(result: any, expected: any, message?: string)`

Asserts that `result` and `expected` are not strictly equal. If `message` is provided, it will be outputted as a description of the assertion.

*Note: uses `!Object.is(result, expected)`*

#### `t.deepEqual(result: any, expected: any, message?: string)`

Asserts that `result` and `expected` are loosely equal, with the same structure and nested values. If `message` is provided, it will be outputted as a description of the assertion.

*Note: uses [node's deepEqual() algorithm][NodeDeepEqual] with strict comparisons (`===`) on leaf nodes*

#### `t.notDeepEqual(result: any, expected: any, message?: string)`

Asserts that `result` and `expected` not loosely equal, with different structure and/or nested values. If `message` is provided, it will be outputted as a description of the assertion.

*Note: uses [node's deepEqual() algorithm][NodeDeepEqual] with strict comparisons (`===`) on leaf nodes*

[NodeDeepEqual]: https://github.com/substack/node-deep-equal

#### `t.ok(result: boolean | any, message?: string)`

Asserts that `result` is truthy. If `message` is provided, it will be outputted as a description of the assertion.

#### `t.notOk(result: boolean | any, message?: string)`

Asserts that `result` is falsy. If `message` is provided, it will be outputted as a description of the assertion.

#### `t.pass(message: string)`

Generates a passing assertion with `message` as a description.

#### `t.fail(message: string)`

Generates a failing assertion with `message` as a description.

#### `t.end()`

Declares the end of a test explicitly. Must be called exactly once per test. (See: [Single Call to `t.end()`](#single-call-to-tend))

#### `t.match(result: string, pattern: string | RegExp, message?: string)`

Asserts that `result` matches the regex `pattern`. If `pattern` is not a valid regex, the assertion fails. If `message` is provided, it will be outputted as a description of the assertion.

#### `t.notMatch(result: string, pattern: string | RegExp, message?: string)`

Asserts that `result` does not match the regex `pattern`. If `pattern` is not a valid regex, the assertion always fails. If `message` is provided, it will be outputted as a description of the assertion.

#### `t.comment(message: string)`

Prints a message without breaking the `TAP` output. Useful when using a `tap`-reporter such as `tap-colorize`, where the output is buffered and `console.log()` will print in incorrect order vis-a-vis `TAP` output.

### Other Built-In Operators

To simplify the core of 📼 **Supertape**, other operators are maintained in separate packages. The following is a list of all such packages:

|Package|Version|
|-------|-------|
| [`@supertape/operator-stub`](/packages/operator-stub) | [![npm][OperatorStubNPMBadge]][OperatorStubNPMLink] |

[OperatorStubNPMBadge]: https://img.shields.io/npm/v/@supertape/operator-stub.svg?maxAge=86400
[OperatorStubNPMLink]: https://www.npmjs.com/package/@supertape/operator-stub

## 🚪 Exit Codes

📼**Supertape** can have one of the following [exit codes](https://github.com/coderaiser/supertape/blob/master/packages/supertape/lib/exit-codes.js) to denote its status:

| Code | Name | Description |
|------|------|-----------------|
| 0    | `OK` | no errors found |
| 1    | `FAIL` | test failed |
| 2    | `WAS_STOP` | test was halted by user |
| 3    | `UNHANDLED`| unhandled exception occurred |
| 4    | `INVALID_OPTION`| wrong option provided |
| 5    | `SKIPED` | works only with [`SUPERTAPE_CHECK_SKIPED`](#supertape_check_skiped) when skiped files 1 and more |

```js
import {SKIPED} from 'supertape/exit-codes';

const env = {
    ESCOVER_SUCCESS_EXIT_CODE: SKIPED,
    SUPERTAPE_CHECK_SKIPED: 1,
};

export default {
    test: () => [env, `escover tape 'test/**/*.js' 'lib/**/*.spec.js'`],
};
```

## 🐊 **Putout**

📼 **Supertape** goes well with 🐊 [**Putout**](https://github.com/coderaiser/putout), which has a number of rules for linting and generating high quality tests.

### Migrating From **tape**

> 🐊 + 📼 = ❤️

You can easily convert your tests from **tape** to 📼 **Supertape** using 🐊 **Putout's** built-in [`@putout/plugin-tape`][PutoutPluginTape]. For a conversion example, check out [this output][PutoutExample].

[PutoutPluginTape]: https://github.com/coderaiser/putout/tree/master/packages/plugin-tape#readme
[PutoutExample]: https://github.com/coderaiser/cloudcmd/commit/74d56f795d22e98937dce0641ee3c7514a79e9e6

### **ESLint** Rules

🐊 **Putout** also provides some **ESLint** rules for 📼 **Supertape** to help ensure high quality tests:

- ✅ [`remove-newline-before-t-end`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-remove-newline-before-t-end#readme)
- ✅ [`add-newline-before-assertion`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-add-newline-before-assertion#readme)
- ✅ [`add-newline-between-tests`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-add-newline-between-tests#readme)
