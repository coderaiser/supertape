'use strict';

const {resolve: resolvePath} = require('path');
const {once} = require('events');

const yargsParser = require('yargs-parser');
const glob = require('glob');
const fullstore = require('fullstore');

const supertape = require('..');

const {resolve} = require;
const {isArray} = Array;

const maybeArray = (a) => isArray(a) ? a : [a];
const removeDuplicates = (a) => Array.from(new Set(a));
const filesCount = fullstore(0);

module.exports = async ({argv, cwd, stdout, exit}) => {
    const args = yargsParser(argv, {
        coerce: {
            require: maybeArray,
        },
        string: [
            'require',
            'format',
        ],
        boolean: [
            'version',
        ],
        alias: {
            r: 'require',
            v: 'version',
            f: 'format',
        },
        default: {
            require: [],
            format: 'tap',
        },
    });
    
    if (args.version)
        return stdout.write(`v${require('../package').version}\n`);
    
    for (const module of args.require)
        await import(resolve(module, {
            paths: [cwd],
        }));
    
    const allFiles = [];
    for (const arg of args._) {
        const files = glob.sync(arg);
        allFiles.push(...files);
    }
    
    const {format} = args;
    
    supertape.init({
        run: false,
        quiet: true,
        format,
    });
    
    supertape.createStream().pipe(stdout);
    
    const promises = [];
    const files = removeDuplicates(allFiles);
    
    for (const file of files) {
        promises.push(import(resolvePath(cwd, file)));
    }
    
    filesCount(files.length);
    
    let code = 0;
    
    if (!promises.length)
        return exit(code);
    
    await Promise.all(promises);
    
    const [{failed}] = await once(supertape.run(), 'end');
    
    code = failed ? 1 : 0;
    exit(code);
};

module.exports._filesCount = filesCount;

