# 📼 Supertape [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMURL]: https://npmjs.org/package/supertape "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusURL]: https://github.com/coderaiser/putout/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/putout/workflows/Node%20CI/badge.svg
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

[![supertape](https://asciinema.org/a/Cgc3rDOfZAeDnJSxzEYpPfBMY.svg)](https://asciinema.org/a/Cgc3rDOfZAeDnJSxzEYpPfBMY)

[Tape](https://github.com/substack/tape)-inspired [TAP](https://testanything.org/)-compatible simplest high speed test runner with superpowers.

📼`Supertape` written from scratch after messing a lot with `tape`, it willing to be compatible with it as much as possible.
and has a couple differences. It contains:

- ability to work with [esm modules](https://nodejs.org/api/esm.html) (take a look at [mock-import](https://github.com/coderaiser/mock-import) for mocking).
- shows colored diff when test not `equal` or not `deepEqual`;
- produces deteiled stack traces for `async functions`;
- as many `only` as you wish;
- ability to extend;
- smart timeouts for long running tests 🏃‍♂️(configured with `SUPERTAPE_TIMEOUT`);
- more natural assertions: `expected, result` -> `result, expected`, for example:

```js
t.equal(error.message, 'hello world', `expected error.message to be 'hello world'`);
```

Doesn't contain:

- `es3 code` and lot's of [ponyfills](https://github.com/sindresorhus/ponyfill#how-are-ponyfills-better-than-polyfills).
- aliases, methods list much shorter;
- `throws`, `doesNotThrows` - use [tryCatch](https://github.com/coderaiser/try-catch), [tryToCatch](https://github.com/coderaiser/try-to-catch) with `equal` instead.

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
```

## Environment variables

- `SUPERTAPE_TIMEOUT` - timeout for long running processes;
- `SUPERTAPE_CHECK_DUPLICATES` - toggle check duplicates;
- `SUPERTAPE_CHECK_SCOPES` - check that test message has a scope: `scope: subject`;
- `SUPERTAPE_CHECK_ASSERTIONS_COUNT` - check that assertion count is no more then 1;

```js
test('tape: error', (t) => {
    t.equal(error.code, 'ENOENT');
    t.end();
});
```

## 🤷 How to migrate from `tape`?

> 🐊 + 📼 = ❤️

You can convert your codebase from `tape` to 📼`Supertape` with help of 🐊[`Putout`](https://github.com/coderaiser/putout), which has built-in 🐲[`@putout/plugin-tape`](https://github.com/coderaiser/putout/tree/master/packages/plugin-tape),
with a lot of rules that helps to write and maintain tests of the highest possible quality.

Here is [result example](https://github.com/coderaiser/cloudcmd/commit/74d56f795d22e98937dce0641ee3c7514a79e9e6).

## `ESLint` rules

[`eslint-plugin-putout`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout#-supertape) has rules for 📼`Supertape`:

- ✅ [`remove-newline-before-t-end`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-remove-newline-before-t-end#readme)
- ✅ [`add-newline-before-assertion`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-add-newline-before-assertion#readme)
- ✅ [`add-newline-between-tests`](https://github.com/coderaiser/putout/tree/master/packages/eslint-plugin-putout/lib/tape-add-newline-between-tests#readme)

## Validation checks

To help you keep quality of your tests on the highest possible level 📼`Supertape` has built-in checks.
When test not passes validation it marked as a new failed test.

### Single `t.end()`

`t.end()` must not be used more than once. This check cannot be disabled
and has auto fixable rule 🐊[`remove-useless-t-end`](https://github.com/coderaiser/putout/blob/master/packages/plugin-tape/README.md#remove-useless-t-end).

#### ❌ Example of incorrect code

```js
test('hello: world', (t) => {
    t.end();
    t.end();
});
```

#### ✅ Example of correct code

```js
test('hello: world', (t) => {
    t.end();
});
```

### Check duplicates

Check for duplicates in test messages. Can be disabled with:

- passing `--no-check-duplicates` command line flag;
- setting `CHECK_DUPLICATES=0` env variable;

#### ❌ Example of incorrect code

```js
test('hello: world', (t) => {
    t.equal(1, 1);
    t.end();
});
```

```js
test('hello: world', (t) => {
    t.equal(2, 1);
    t.end();
});
```

### Check scopes

Check that test message are divided on groups by colons. Can be disabled with:

- passing `--no-check-scopes` command line flag;
- setting `CHECK_SCOPES=0` env variable;

#### ❌ Example of incorrect code

```js
test('hello', (t) => {
    t.equal(1, 1);
    t.end();
});
```

#### ✅ Example of correct code

```js
test('hello: world', (t) => {
    t.equal(1, 1);
    t.end();
});
```

### Check assertions count

Check that test contains exactly one assertion. Can be disabled with:

- passing `--no-check-assertions-count` command line flag;
- setting `CHECK_ASSERTIONS_COUNT=0` env variable;

#### ❌ Example of incorrect code

```js
test('hello: no assertion', (t) => {
    t.end();
});

test('hello: more then one assertion', (t) => {
    t.equal(1, 1);
    t.equal(2, 2);
    t.end();
});
```

#### ✅ Example of correct code

```js
test('hello: one', (t) => {
    t.equal(1, 1);
    t.end();
});

test('hello: two', (t) => {
    t.equal(2, 2);
    t.end();
});
```

## Operators

To simplify `supertape` core operators located in separate packages, called `operators`:

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

### Methods

The assertion methods in `supertape` are heavily influenced by [tape](https://github.com/substack/tape).

```js
const test = require('supertape');
const {sum} = require('./calc.js');

test('calc: sum', (t) => {
    const result = sum(1, 2);
    const expected = 3;
    
    t.equal(result, expected);
    t.end();
});
```

or in `ESM`:

```js
import {test} from 'supertape';
import {sum} from './calc.js';

test('calc: sum', (t) => {
    const result = sum(1, 2);
    const expected = 3;
    
    t.equal(result, expected);
    t.end();
});
```

## test(name, cb)

Create a new test with `name` string.
`cb(t)` fires with the new test object `t` once all preceding tests have
finished. Tests execute serially.

## test.only(name, cb)

Like `test(name, cb)` except if you use `.only` this is the only test case
that will run for the entire process, all other test cases using `tape` will
be ignored.

## test.skip(name, cb)

Generate a new test that will be skipped over.

## test.extend(extensions)

Extend base assertions with more:

```js
const {extend} = require('supertape');
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

## t.end()

Declare the end of a test explicitly.

## t.fail(msg)

Generate a failing assertion with a message `msg`.

## t.pass(msg)

Generate a passing assertion with a message `msg`.

## t.ok(value, msg)

Assert that `value` is truthy with an optional description of the assertion `msg`.

## t.notOk(value, msg)

Assert that `value` is falsy with an optional description of the assertion `msg`.

## t.match(actual, pattern[, msg])

Assert that `pattern: string | regexp` matches `actual` with an optional description of the assertion `msg`.

## t.notMatch(actual, pattern[, msg])

Assert that `pattern: string | regexp`  not matches `actual` with an optional description of the assertion `msg`.

## t.equal(actual, expected, msg)

Assert that `Object.is(actual, expected)` with an optional description of the assertion `msg`.

## t.notEqual(actual, expected, msg)

Assert that `!Object.is(actual, expected)` with an optional description of the assertion `msg`.

## t.deepEqual(actual, expected, msg)

Assert that `actual` and `expected` have the same structure and nested values using
[node's deepEqual() algorithm](https://github.com/substack/node-deep-equal)
with strict comparisons (`===`) on leaf nodes and an optional description of the assertion `msg`.

## t.notDeepEqual(actual, expected, msg)

Assert that `actual` and `expected` do not have the same structure and nested values using
[node's deepEqual() algorithm](https://github.com/substack/node-deep-equal)
with strict comparisons (`===`) on leaf nodes and an optional description of the assertion `msg`.

## t.comment(message)

Print a message without breaking the tap output. (Useful when using e.g. `tap-colorize` where output is buffered & `console.log` will print in incorrect order vis-a-vis tap output.)

## Example

```js
const test = require('supertape');

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

## License

MIT
