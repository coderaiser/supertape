'use strict';

const {resolve: resolvePath} = require('path');

const yargsParser = require('yargs-parser');
const glob = require('glob');
const fullstore = require('fullstore');

const supertape = require('../lib/supertape.js');

const {resolve} = require;
const {isArray} = Array;

const maybeArray = (a) => isArray(a) ? a : [a];
const removeDuplicates = (a) => Array.from(new Set(a));
const filesCount = fullstore(0);

module.exports = async ({argv, cwd, write}) => {
    const args = yargsParser(argv, {
        coerce: {
            require: maybeArray,
        },
        string: [
            'require',
        ],
        boolean: [
            'version',
        ],
        alias: {
            r: 'require',
            v: 'version',
        },
        default: {
            require: [],
        },
    });
    
    if (args.version)
        return write(`v${require('../package').version}\n`);
    
    for (const module of args.require) {
        await import(resolve(module, {
            paths: [cwd],
        }));
    }
    
    supertape.init({
        loop: false,
    });
    
    const allFiles = [];
    for (const arg of args._) {
        const files = glob.sync(arg);
        allFiles.push(...files);
    }
    
    const promises = [];
    const files = removeDuplicates(allFiles);
    
    for (const file of files) {
        promises.push(import(resolvePath(cwd, file)));
    }
    
    filesCount(files.length);
    
    if (promises.length) {
        await Promise.all(promises);
        supertape.loop();
    }
};

module.exports._filesCount = filesCount;

