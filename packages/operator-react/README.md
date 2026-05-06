# @supertape/operator-react [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/supertape "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

`supertape` operator simplifies work with colored and indented output.

## Install

```
npm i @supertape/operator-react -D
```

## Operators

Adds next operators to work with:

### reactEqual(fn, args [, message])

```js
import {extend} from 'supertape';
import react from '@supertape/operator-react';
import {montag} from 'montag';

const test = extend(react);

test('redlint: react', (t) => {
    const [, result] = redlintTest(filesystem, {
        branch,
    });
    
    const expected = montag`
        # 🍄 hello
    `;
    
    t.reactEqual(result, expected);
    t.end();
});
```

### t.reactEndEqual(fn[, message])

```js
import test, {react} from 'supertape';
import {montag} from 'montag';

test('function called with no args', (t) => {
    const expected = montag`
        # 🍀 hello
    `;
    
    t.reactEndEqual(result, expected);
    t.end();
});
```

## License

MIT
