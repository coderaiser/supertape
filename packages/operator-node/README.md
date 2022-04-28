# @supertape/operator-node [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/supertape "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

> The `node:test` module facilitates the creation of JavaScript tests that report results in TAP format
>
> (c) [nodejs.org](https://nodejs.org/dist/latest-v18.x/docs/api/test.html#test-runner)

📼*Supertape* operator that wraps [node:test](https://nodejs.org/dist/latest-v18.x/docs/api/test.html#test-runner).

## Install

```
npm i @supertape/operator-node -D
```

## Operators

Adds next operators to work with:

### t.test(fn, args [, message])

> The test context's `test()` method allows subtests to be created. This method behaves identically to the top level `test()` function. The following example demonstrates the creation of a top level test with two subtests.
>
> (c) [nodejs.org](https://nodejs.org/dist/latest-v18.x/docs/api/test.html#subtest)

```js
import assert from 'assert';
import test from 'supertape';

test('top level test', async (t) => {
    await t.test('subtest 1', (t) => {
        assert.strictEqual(1, 1);
    });

    await t.test('subtest 2', (t) => {
        assert.strictEqual(2, 2);
    });
});
```
### t.diagnostic(message)

> This function is used to write TAP diagnostics to the output. Any diagnostic information is included at the end of the test's results. This function does not return a value.
>
> (c) [nodejs.org](https://nodejs.org/dist/latest-v18.x/docs/api/test.html#contextdiagnosticmessage)

```js
import assert from 'assert';
import test from 'supertape';

test('top level test', async (t) => {
    t.diagnostic('hello');
    assert.strictEqual(1, 1);
});
```

### t.todo([message])

> This function adds a TODO directive to the test's output. If message is provided, it is included in the TAP output. Calling `todo()` does not terminate execution of the test function. This function does not return a value.
>
> (c) [nodejs.org](https://nodejs.org/dist/latest-v18.x/docs/api/test.html#contexttodomessage)

```js
import assert from 'assert';
import test from 'supertape';

test('top level test', async (t) => {
    t.todo('continue tomorrow...');
    assert.strictEqual(1, 1);
});
```

## License

MIT
