# @supertape/engine-loader [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://github.com/coderaiser/supertape/workflows/Node%20CI/badge.svg
[NPMURL]: https://npmjs.org/package/supertape "npm"
[BuildStatusURL]: https://github.com/coderaiser/supertape/actions?query=workflow%3A%22Node+CI%22
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

Load operators into `supertape`.

## Install

```
npm i @supertape/engine-loader -D
```

## Examples

```js
import {loadOperators} from '@supertape/engine-loader';
import {extend, stub} from 'supertape';

const operators = await loadOperators(['stub']);

const test = extend(operators);

test('with operators', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledWith(fn, ['hello']);
    t.end();
});
```

## License

MIT
