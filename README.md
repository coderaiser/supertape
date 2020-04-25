# Supertape [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/supertape.svg?style=flat&longCache=true
[NPMURL]:                   https://npmjs.org/package/supertape "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/supertape  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/supertape "Dependency Status"

[CoverageURL]:              https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

Tape with superpowers. Contains:

- ability to work with `esm modules`;
- ability to `catch` exceptions and fail one test instead of all;
- handle double `end` errors (https://github.com/substack/tape/pull/503#issuecomment-619402717)
- shows diff when test not `equal` or not `deepEqual`;
- add `jsonEqual` that converts to `json` before checking isEqual

## Install

```
npm i supertape -D
```

## Codemod

You can convert your codebase from `tape` to `supertape` with help of a [convert-tape-to-supertape](https://github.com/coderaiser/putout/tree/master/codemods/convert-tape-to-supertape) codemod.
Here is [example of a result](https://github.com/coderaiser/cloudcmd/commit/74d56f795d22e98937dce0641ee3c7514a79e9e6).

## Example

```js
const test = require('supertape');

test('lib: arguments', async (t) => {
    throw Error('hello');
    // will call t.fail with an error
    // will call t.end
    
    t.end();
});

test('lib: diff', async (t) => {
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
`
```

## Related

- [try-to-tape](https://github.com/coderaiser/try-to-tape "try-to-tape") - wrap `tape` async functions and show error on reject;
- [@cloudcmd/stub](https://github.com/cloudcmd/stub "Stub") - simplest sinon.stub alternative with diff support;

## License

MIT

