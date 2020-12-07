'use strict';

const {resolve: resolvePath} = require('path');

const yargsParser = require('yargs-parser');
const glob = require('glob');
const supertape = require('../lib/supertape.js');

const {resolve} = require;
const {isArray} = Array;
const maybeArray = (a) => isArray(a) ? a : [a];

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
    
    const promises = [];
    
    for (const arg of args._) {
        const files = glob.sync(arg);
        
        for (const file of files) {
            promises.push(import(resolvePath(cwd, file)));
        }
    }
    
    if (promises.length) {
        await Promise.all(promises);
        supertape.loop();
    }
};

