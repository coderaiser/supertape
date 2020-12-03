#!/usr/bin/env node

import {createRequire} from 'module';
import {resolve as resolvePath} from 'path';

import yargsParser from 'yargs-parser';
import glob from 'glob';

const {isArray} = Array;
const require = (a) => isArray(a) ? a : [a];

const opts = yargsParser(process.argv.slice(2), {
    coerce: {
        require,
    },
    string: [
        'require',
    ],
    alias: {
        r: 'require',
    },
    default: {
        require: [],
    },
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
    
    for (const file of files) {
        import(resolvePath(cwd, file));
    }
}

