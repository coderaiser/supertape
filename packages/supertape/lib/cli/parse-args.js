'use strict';

const process = require('node:process');
const yargsParser = require('yargs-parser');
const {isArray} = Array;
const maybeFirst = (a) => isArray(a) ? a.pop() : a;
const maybeArray = (a) => isArray(a) ? a : [a];

const getYargsOptions = () => {
    const {
        SUPERTAPE_CHECK_DUPLICATES = '1',
        SUPERTAPE_CHECK_SCOPES = '1',
        SUPERTAPE_CHECK_ASSERTIONS_COUNT = '1',
    } = process.env;
    
    const yargsOptions = {
        configuration: {
            'strip-aliased': true,
            'strip-dashed': true,
        },
        coerce: {
            require: maybeArray,
            format: maybeFirst,
        },
        string: [
            'format',
            'require',
        ],
        boolean: [
            'version',
            'help',
            'check-duplicates',
            'check-scopes',
            'check-assertions-count',
            'worker',
            'dry-run',
        ],
        alias: {
            version: 'v',
            format: 'f',
            help: 'h',
            require: 'r',
            checkDuplicates: 'd',
            checkScopes: 's',
            checkAssertionsCount: 'a',
        },
        default: {
            format: 'progress-bar',
            require: [],
            checkDuplicates: SUPERTAPE_CHECK_DUPLICATES !== '0',
            checkScopes: SUPERTAPE_CHECK_SCOPES !== '0',
            checkAssertionsCount: SUPERTAPE_CHECK_ASSERTIONS_COUNT !== '0',
            worker: true,
        },
    };
    
    return yargsOptions;
};

module.exports.getYargsOptions = getYargsOptions;

module.exports.parseArgs = (argv) => {
    return yargsParser(argv, getYargsOptions());
};
