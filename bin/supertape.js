#!/usr/bin/env node

'use strict';

const resolveModule = require('resolve').sync;
const resolvePath = require('path').resolve;
const {readFileSync} = require('fs');

const parseOpts = require('minimist');
const glob = require('glob');
const ignore = require('dotignore');
const tryCatch = require('try-catch');

const superImport = require('../lib/super-import');

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
        require(resolveModule(module, {basedir: cwd}));
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
    
    files.filter((file) => { return !matcher || !matcher.shouldIgnore(file); }).forEach(async (file) => {
        await superImport(resolvePath(cwd, file));
    });
}

