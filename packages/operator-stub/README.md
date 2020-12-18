# @supertape/operator-stub [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/supertape.svg?style=flat&longCache=true
[BuildStatusIMGURL]: https://img.shields.io/travis/coderaiser/supertape/master.svg?style=flat&longCache=true
[DependencyStatusIMGURL]: https://img.shields.io/david/coderaiser/supertape.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/supertape "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/supertape "Build Status"
[DependencyStatusURL]: https://david-dm.org/coderaiser/supertape "Dependency Status"
[CoverageURL]: https://coveralls.io/github/coderaiser/supertape?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/supertape/badge.svg?branch=master&service=github

`supertape` operator simplifies work with [@cloudcmd/stub](https://github.com/cloudcmd/stub).

## Install

```
npm i @supertape/operator-stub -D
```

## Operators

Adds next operators to work with:

### t.called(fn [, message])
```js
import test, {stub} from 'supertape';

test('function call', (t) => {
    const fn = stub();
    
    fn('hello', 'world');
    
    t.calledWith(fn, ['hello', 'world'], 'fn should be called with "hello", "world"');
    t.end();
});
```
### t.notCalled(fn [, message])
### t.calledWith(fn, args[, message])
### t.calledCount(fn, count[, message])
### t.calledOnce(fn, count[, message])
### t.calledTwice(fn, count[, message])
### t.calledWithNew(fn, count[, message])

## License

MIT
