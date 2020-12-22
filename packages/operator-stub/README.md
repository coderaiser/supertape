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
```js
import test, {stub} from 'supertape';

test('function not called', (t) => {
    const fn = stub();
    
    t.notCalled(fn);
    t.end();
});
```
### t.calledWith(fn, args[, message])
```js
import test, {stub} from 'supertape';

test('function called with args', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledWith(fn, ['hello']);
    t.end();
});
```
### t.calledWithNoArguments(fn[, message])
```js
import test, {stub} from 'supertape';

test('function called with no args', (t) => {
    const fn = stub();
    const fail = stub();
    
    const calledWith = operator.calledWith({
        fail,
    });
    
    fn();
    calledWith(fn);
    
    t.calledWith(fail, [`You haven't provided 'arguments', looks like you need 't.calledWithNoArgs()'`]);
    t.end();
});
```
### t.calledCount(fn, count[, message])
```js
import test, {stub} from 'supertape';

test('function called count', (t) => {
    const fn = stub();
    
    fn();
    fn();
    
    t.calledCount(fn, 2);
    t.end();
});
```
### t.calledOnce(fn, count[, message])
```js
import test, {stub} from 'supertape';

test('function called once', (t) => {
    const fn = stub();
    
    fn('hello');
    
    t.calledOnce(fn);
    t.end();
});
```
### t.calledTwice(fn, count[, message])
```js
import test, {stub} from 'supertape';

test('function called twice', (t) => {
    const fn = stub();
    
    fn('hello');
    fn('world');
    
    t.calledTwice(fn);
    t.end();
});
```
### t.calledWithNew(fn, count[, message])
```js
import test, {stub} from 'supertape';

test('function called with new', (t) => {
    const fn = stub();
    
    new fn();
    
    t.calledWithNew(fn);
    t.end();
});
```

## License

MIT
