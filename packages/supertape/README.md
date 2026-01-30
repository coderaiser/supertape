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

- the ability to work with [ESM Modules](https://nodejs.org/api/esm.html) (take a look at [mock-import](https://github.com/coderaiser/mock-import) for mocking and 🎩[ESCover](https://github.com/coderaiser/escover) for coverage)
- a number of [built-in pretty output formatters](#formatters)
- the ability to [extend](#testextendextensions)
- showing colored diff when using the [`t.equal()`](#tequalresult-any-expected-any-message-string) and [`t.deepEqual()`](#tdeepequalresult-any-expected-any-message-string) assertion operators
- detailed stack traces for `async` functions
- multiple [`test.only`'s](#testonlyname-cb)
- [smart timeouts](#environment-variables) for long running tests 🏃‍♂️
- more natural assertions: `expected, result` -> `result, expected`:

  ```js
  t.equal(error.message, 'hello world', `expected error.message to be 'hello world'`);
  ```
  
- ability to test files that imports css with:

```sh
NODE_OPTIONS="--import supertape/css" tape '{bin,lib}/**/*.spec.*'
```

📼 **Supertape** doesn't contain:

- assertion aliases, making the available operators far more concise
- `es3 code` and lot's of [ponyfills](https://github.com/sindresorhus/ponyfill#how-are-ponyfills-better-than-polyfills);
- `t.throws()`, `t.doesNotThrow()` - use [**tryCatch**](https://github.com/coderaiser/try-catch) or [**tryToCatch**](https://github.com/coderaiser/try-to-catch) with [`t.equal()`](#tequalresult-any-expected-any-message-string) instead;
- [`t.plan()`](https://github.com/substack/tape#tplann);

For a list of all built-in assertions, see [Operators](#operators).

## How 📼**Supertape** test looks like?

You can use both **CommonJS** and **ESM**, here is **ESM** example:

```js
import {test} from 'supertape';

const sump = (a, b) => a + b;

test('calc: sum', (t) => {
    const result = sum(1, 2);
    const expected = 3;
    
    t.equal(result, expected);
    t.end();
});
```

## Install

```
npm i supertape -D
```

## Usage

```
Usage: supertape [options] [path]
Options
   -h, --help                  display this help and exit
   -v, --version               output version information and exit
   -f, --format                use a specific output format - default: progress-bar/tap on CI
   -r, --require               require module
   --no-check-scopes           do not check that messages contains scope: 'scope: message'
   --no-check-assertions-count do not check that assertion count is no more then 1
   --no-check-duplicates       do not check messages for duplicates
   --no-worker                 disable worker thread
```

## Environment variables

- `SUPERTAPE_TIMEOUT` - timeout for long running processes, defaults to `3000` (3 seconds);
- `SUPERTAPE_CHECK_DUPLICATES` - toggle check duplicates;
- `SUPERTAPE_CHECK_SCOPES` - check that test message has a scope: `scope: subject`;
- `SUPERTAPE_CHECK_ASSERTIONS_COUNT` - check that assertion count is no more then 1;
- `SUPERTAPE_CHECK_SKIPPED` - check that skipped count equal to `0`, exit with status code;
- `SUPERTAPE_LOAD_LOOP_TIMEOUT` - timeout for load tests, defaults to `5ms`, when mocha used as runner - `50ms` optimal;

```js
test('tape: error', (t) => {
    t.equal(error.code, 'ENOENT');
    t.end();
});
```

## 🤷 How to migrate from `tape`?

You can convert your codebase from `tape` to 📼`Supertape` with help of 🐊[`Putout`](https://github.com/coderaiser/putout), which has built-in [@putout/plugin-tape](https://github.com/coderaiser/putout/tree/master/packages/plugin-tape),
which has a lot of rules that helps to write tests.
Here is [result example](https://github.com/coderaiser/cloudcmd/commit/74d56f795d22e98937dce0641ee3c7514a79e9e6).

## `ESLint` rules

[`eslint-plugin-putout`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout#readme) has rules for 📼`Supertape`:

- ✅ [`remove-newline-before-t-end`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-remove-newline-before-t-end#readme)
- ✅ [`add-newline-before-assertion`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-add-newline-before-assertion#readme)
- ✅ [`add-newline-between-tests`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-add-newline-between-tests#readme)

## Operators

The assertion methods of 📼 **Supertape** are heavily influenced by [**tape**](https://github.com/substack/tape). However, to keep a minimal core of assertions, there are no aliases and some superfluous operators have been removed (such as `t.throws()`).

The following is a list of the base methods maintained by 📼 **Supertape**. Others, such as assertions for stubbing, are maintained in [special operators](#special-operators). To add custom assertion operators, see [Extending](#testextendextensions).

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

Declares the end of a test explicitly. Must be called exactly once per test. (See: [Single Call to `t.end()`](#single-tend))

#### `t.match(result: string, pattern: string | RegExp, message?: string)`

Asserts that `result` matches the regex `pattern`. If `pattern` is not a valid regex, the assertion fails. If `message` is provided, it will be outputted as a description of the assertion.

#### `t.notMatch(result: string, pattern: string | RegExp, message?: string)`

Asserts that `result` does not match the regex `pattern`. If `pattern` is not a valid regex, the assertion always fails. If `message` is provided, it will be outputted as a description of the assertion.

#### `t.comment(message: string)`

Print a message without breaking the `TAP` output. Useful when using a `tap`-reporter such as `tap-colorize`, where the output is buffered and `console.log()` will print in incorrect order vis-a-vis `TAP` output.

### Special Operators

To simplify the core of 📼 **Supertape**, other operators are maintained in separate packages. The following is a list of all such packages:

Here is a list of built-int operators:

| Package | Version |
|--------|-------|
| [`@supertape/operator-stub`](/packages/operator-stub) | [![npm](https://img.shields.io/npm/v/@supertape/operator-stub.svg?maxAge=86400)](https://www.npmjs.com/package/@supertape/operator-stub) |

## Formatters

There is a list of built-int `formatters` to customize output:

| Package | Version |
|--------|-------|
| [`@supertape/formatter-tap`](/packages/formatter-tap) | [![npm](https://img.shields.io/npm/v/@supertape/formatter-tap.svg?maxAge=86400)](https://www.npmjs.com/package/@supertape/formatter-tap) |
| [`@supertape/formatter-fail`](/packages/formatter-fail) | [![npm](https://img.shields.io/npm/v/@supertape/formatter-fail.svg?maxAge=86400)](https://www.npmjs.com/package/@supertape/formatter-fail) |
| [`@supertape/formatter-short`](/packages/formatter-short) | [![npm](https://img.shields.io/npm/v/@supertape/formatter-short.svg?maxAge=86400)](https://www.npmjs.com/package/@supertape/formatter-short) |
| [`@supertape/formatter-progress-bar`](/packages/formatter-progress-bar) | [![npm](https://img.shields.io/npm/v/@supertape/formatter-progress-bar.svg?maxAge=86400)](https://www.npmjs.com/package/@supertape/formatter-progress-bar) |
| [`@supertape/formatter-json-lines`](/packages/formatter-json-lines) | [![npm](https://img.shields.io/npm/v/@supertape/formatter-json-lines.svg?maxAge=86400)](https://www.npmjs.com/package/@supertape/formatter-json-lines) |

## API

### test(message: string, fn: (t: Test) => void, options?: TestOptions)

Create a new test with `message` string.
`fn(t)` fires with the new test object `t` once all preceding tests have
finished. Tests execute serially.

Here is Possible `options` similar to [Environment Variables](#environment-variables) but relates to one test:

- `checkDuplicates`;
- `checkScopes`;-
- `checkAssertionsCount`;
- `timeout`;

### test.only(message, fn, options?)

Like `test(name, cb)` except if you use `.only` this is the only test case
that will run for the entire process, all other test cases using `tape` will
be ignored.

### test.skip(message, fn, options?)

Generate a new test that will be skipped over.

### test.extend(extensions)

Extend base assertions with more:

```js
import {extend} from 'supertape';

const test = extend({
    transform: (operator) => (a, b, message = 'should transform') => {
        const {is, output} = operator.equal(a + 1, b - 1);
        
        return {
            is,
            output,
        };
    },
});

test('assertion', (t) => {
    t.transform(1, 3);
    t.end();
});
```

## Example

```js
import {test} from 'supertape';

test('lib: arguments', async (t) => {
    throw Error('hello');
    // will call t.fail with an error
    // will call t.end
});

test('lib: diff', (t) => {
    t.equal({}, {hello: 'world'}, 'should equal');
    t.end();
});

// output
`
- Expected
+ Received

- Object {}
+ Object {
+   "hello": "world",
+ }
`;
```

## 🚪Exit Codes

📼**Supertape** can have one of next [exit codes](https://github.com/coderaiser/supertape/blob/master/packages/supertape/lib/exit-codes.js):

| Code | Name | Description |
|------|------|-----------------|
| 0    | `OK` | no errors found |
| 1    | `FAIL` | test failed |
| 2    | `WAS_STOP` | test was halted by user |
| 3    | `UNHANDLED`| unhandled exception occurred |
| 4    | `INVALID_OPTION`| wrong option provided |
| 5    | `SKIPPED` | works only with `SUPERTAPE_CHECK_SKIPPED` env variable when skipped files 1 and more |

Here is how exit code can look like:

```js
import {SKIPPED} from 'supertape/exit-codes';

const env = {
    ESCOVER_SUCCESS_EXIT_CODE: SKIPPED,
    SUPERTAPE_CHECK_SKIPPED: 1,
};

export default {
    test: () => [env, `escover tape 'test/**/*.js' 'lib/**/*.spec.js'`],
};
```

## License

MIT
