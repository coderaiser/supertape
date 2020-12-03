#!/usr/bin/env node

import {resolve as resolvePath} from 'path';

import yargsParser from 'yarser-parser';
import parseOpts from 'minimist';
import glob from 'glob';
import ignore from 'dotignore';
import tryCatch from 'try-catch';

const {isArray} = Array;
const maybeArray = (a) => isArray(a) ? a : [a];

const opts = yargsParser(process.argv.slice(2), {
    coerce: {
        require: maybeArray,
    },
    string: [
        'require',
    ],
    alias: {
        r: 'require'
    },
    default: {
        require: [],
    }
});

const cwd = process.cwd();

for (const module of opts.require) {
    if (module) {
        /* This check ensures we ignore `-r ""`, trailing `-r`, or
         * other silly things the user might (inadvertently) be doing.
         */
        const {resolve} = createRequire(import.meta.url);
        await import(resolve(module, {
            paths: [cwd],
        }));
    }
}

for (const arg of opts._) {
    const files = glob.sync(arg);
    
    const list = files.filter((file) => {
        return !matcher || !matcher.shouldIgnore(file);
    });
    
    for (const file of list) {
        import(resolvePath(cwd, file));
    }
}

