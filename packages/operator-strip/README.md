# @supertape/operator-strip [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/supertape "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

`supertape` operator simplifies work with colored and indented output.

## Install

```
npm i @supertape/operator-strip -D
```

## Operators

Adds next operators to work with:

### stripEqual(fn, args [, message])

```js
import {extend} from 'supertape';
import strip from '@supertape/operator-strip';
import montag from 'montag';

const test = extend(strip);

test('redlint: strip', (t) => {
    const [, result] = redlintTest(filesystem, {
        branch,
    });
    
    const expected = montag`
        # 🍄 hello
    `;
    
    t.stripEqual(result, expected);
    t.end();
});
```

### t.stripEndEqual(fn[, message])

```js
import test, {strip} from 'supertape';
import montag from 'montag';

test('function called with no args', (t) => {
    const expected = montag`
        # 🍀 hello
    `;
    
    t.stripEndEqual(result, expected);
    t.end();
});
```

## License

MIT
