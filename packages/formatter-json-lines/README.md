# @supertape/formatter-json-lines [![NPM version][NPMIMGURL]][NPMURL]

[NPMIMGURL]: https://img.shields.io/npm/v/@supertape/formatter-json-lines.svg?style=flat&longCache=true
[NPMURL]: https://npmjs.org/package/@supertape/formatter-json-lines "npm"

📼[`Supertape`](https://github.com/coderaiser/supertape) formatter shows [json-lines](https://jsonlines.org/)

## Install

```
npm i supertape @supertape/formatter-json-lines
```

## Usage

```
supertape --format json-lines lib

{"count":1,"total":3,"failed":0,"test":"supertape: format: json-lines"}
{"count":2,"total":3,"failed":0,"test":"supertape: format: json-lines: skip"}
{"count":3,"total":3,"failed":0,"test":"supertape: format: json-lines: comment"}
{"count":3,"passed":3,"failed":0,"skiped":0}
```

## License

MIT
