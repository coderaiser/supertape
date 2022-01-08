# @supertape/formatter-progress-bar [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@supertape/formatter-progress-bar.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@supertape/formatter-progress-bar "npm"

📼[`Supertape`](https://github.com/coderaiser/supertape) formatter shows progress bar.

## Install

```
npm i supertape @supertape/formatter-progress-bar
```

## Usage

```
supertape --format progress-bar lib
```

## Env Variables

- `CI=1` - disable progress bar
- `SUPERTAPE_PROGRESS_BAR=1` - force enable/disable progress bar;
- `SUPERTAPE_PROGRESS_BAR_COLOR` - set color of progress bar;
- `SUPERTAPE_PROGRESS_BAR_MIN=100` - count of tests to show progress bar;
- `SUPERTAPE_PROGRESS_BAR_STACK=1` - force show/hide stack on fail;

## License

MIT
