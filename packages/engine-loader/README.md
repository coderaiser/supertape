# @supertape/engine-loader [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[DependencyStatusIMGURL]: https://img.shields.io/david/coderaiser/supertape.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/supertape "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[DependencyStatusURL]: https://david-dm.org/coderaiser/supertape "Dependency Status"
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
import {
    extend,
    stub,
} from 'supertape';

const operators = await loadOperators([
    'stub',
]);

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
