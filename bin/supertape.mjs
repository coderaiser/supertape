#!/usr/bin/env node

'use strict';

import {resolve as resolvePath} from 'path';
import {readFileSync} from 'fs';

import parseOpts from 'minimist';
import glob from 'glob';
import ignore from 'dotignore';
import tryCatch from 'try-catch';
import {createRequire} from 'module';

const {isArray} = Array;

const opts = parseOpts(process.argv.slice(2), {
    alias: {r: 'require', i: 'ignore'},
    string: ['require', 'ignore'],
    default: {r: [], i: null},
});

const cwd = process.cwd();

if (typeof opts.require === 'string') {
    opts.require = [opts.require];
}

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

let matcher;

if (typeof opts.ignore === 'string') {
    const name = resolvePath(cwd, opts.ignore || '.gitignore');
    const [error, ignoreStr] = tryCatch(readFileSync, name, 'utf-8');
    
    if (error) {
        console.error(error.message);
        process.exit(2);
    }
    
    matcher = ignore.createMatcher(ignoreStr);
}

for (const arg of opts._) {
    // If glob does not match, `files` will be an empty array.
    // Note: `glob.sync` may throw an error and crash the node process.
    const files = glob.sync(arg);
    
    if (!isArray(files))
        throw TypeError('unknown error: glob.sync did not return an array or throw. Please report this.');
    
    const list = files.filter((file) => {
        return !matcher || !matcher.shouldIgnore(file);
    });
    
    for (const file of list) {
        await import(resolvePath(cwd, file));
    }
}

