# @supertape/formatter-progress-bar [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL]

[NPMIMGURL]:                https://img.shields.io/npm/v/@supertape/formatter-progress-bar.svg?style=flat&longCache=true
[NPMURL]:                   https://npmjs.org/package/@supertape/formatter-progress-bar "npm"

[DependencyStatusURL]:      https://david-dm.org/coderaiser/supertape?path=packages/formatter-progress-bar
[DependencyStatusIMGURL]:   https://david-dm.org/coderaiser/supertape.svg?path=packages/formatter-progress-bar

`supertape` formatter shows progress bar.

## Install

```
npm i supertape @supertape/formatter-progress-bar
```

## Usage

```
supertape --format progress-bar lib
```

## Env Variables

`CI=1` - disable progress bar
`SUPERTAPE_PROGRESS_BAR=1` - force enable progress bar
`SUPERTAPE_PROGRESS_BAR_MIN=100` - count of tests to show progress bar

## License

MIT

