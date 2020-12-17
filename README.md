# Supertape [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMURL]: https://npmjs.org/package/supertape "npm"
[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[DependencyStatusURL]: https://david-dm.org/coderaiser/supertape?path=packages/supertape "Dependency Status"
[DependencyStatusIMGURL]: https://david-dm.org/coderaiser/supertape.svg?path=packages/supertape
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

[Tape](https://github.com/substack/tape) compatible [TAP](https://testanything.org/) test runner with superpowers. Contains:

- ability to work with [esm modules](https://nodejs.org/api/esm.html) (take a look at [mock-import](https://github.com/coderaiser/mock-import) for mocking).
- shows colored diff when test not `equal` or not `deepEqual`;
- produces deteiled stack traces for `async functions`;
- as many `only` as you wish
- ability to extend
- more natural assertions: `expected, result` -> `result, expected`, for example:

```js
t.equal(error.message, 'hello world', `expected error.message to be 'hello world'`);
```

Doesn't contain:

- `es3 code` and lot's of [ponyfills](https://github.com/sindresorhus/ponyfill#how-are-ponyfills-better-than-polyfills).
- aliases, methods list much shorter;
- `throws`, `doesNotThrows` - use [tryCatch](https://github.com/coderaiser/try-catch), [tryToCatch](https://github.com/coderaiser/try-to-catch) with `equal` instead.

`Supertape` was written for scratch after messing a lot with `tape`, it inspired by `tape` and willing to be compatible with it.

## Install

```
npm i supertape -D
```

## Codemod

You can convert your codebase from `tape` to `supertape` with help of a [putout](https://github.com/coderaiser/putout) and built-in [@putout/plugin-tape](https://github.com/coderaiser/putout/tree/master/packages/plugin-tape).
Here is [example of a result](https://github.com/coderaiser/cloudcmd/commit/74d56f795d22e98937dce0641ee3c7514a79e9e6).

## API

### Methods

The assertion methods in `supertape` are heavily influenced or copied from the methods
in [tape](https://github.com/substack/tape).

```js
const test = require('supertape');
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

## t.equal(actual, expected, msg)

Assert that `Object.is(actual, expected)` with an optional description of the assertion `msg`.

Aliases: `t.equals()`, `t.isEqual()`, `t.strictEqual()`, `t.strictEquals()`, `t.is()`

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
    
    t.end();
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

## Related

- [try-to-tape](https://github.com/coderaiser/try-to-tape "try-to-tape") - wrap `tape` async functions and show error on reject;
- [@cloudcmd/stub](https://github.com/cloudcmd/stub "Stub") - simplest sinon.stub alternative with diff support;

## License

MIT
