# @supertape/formatter-time [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@supertape/formatter-time.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@supertape/formatter-time "npm"

📼[`Supertape`](https://github.com/coderaiser/supertape) formatter shows progress bar.

## Install

```
npm i supertape @supertape/formatter-time
```

## Usage

```
supertape --format time lib
```

## Env Variables

- `CI=1` - disable progress bar
- `SUPERTAPE_TIME=1` - force enable/disable progress bar;
- `SUPERTAPE_TIME_COLOR` - set color of progress bar;
- `SUPERTAPE_TIME_MIN=100` - count of tests to show progress bar;
- `SUPERTAPE_TIME_STACK=1` - force show/hide stack on fail;
- `SUPERTAPE_TIME_CLOCK=⏳` - set clock icon;

## License

MIT
