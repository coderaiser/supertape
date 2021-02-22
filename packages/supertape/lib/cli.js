'use strict';

const {resolve: resolvePath} = require('path');
const {once} = require('events');

const yargsParser = require('yargs-parser');
const glob = require('glob');
const fullstore = require('fullstore');
const tryToCatch = require('try-to-catch');
const keypress = require('@putout/cli-keypress');
const {createSimport} = require('simport');

const simport = createSimport(__filename);

const supertape = require('..');
const {exitCodes, getExitCode} = require('./exit');

const {OK} = exitCodes;

const {resolve} = require;
const {isArray} = Array;

const maybeFirst = (a) => isArray(a) ? a.pop() : a;
const maybeArray = (a) => isArray(a) ? a : [a];

const removeDuplicates = (a) => Array.from(new Set(a));
const filesCount = fullstore(0);

module.exports = async ({argv, cwd, stdout, stderr, exit}) => {
    const {isStop} = keypress();
    const [error, failed] = await tryToCatch(cli, {
        argv,
        cwd,
        stdout,
        exit,
        isStop,
    });
    
    if (error)
        stderr.write(error.stack);
    
    exit(getExitCode({
        error,
        failed,
        isStop,
    }));
};

async function cli({argv, cwd, stdout, isStop}) {
    const args = yargsParser(argv, {
        coerce: {
            require: maybeArray,
            format: maybeFirst,
        },
        string: [
            'require',
            'format',
        ],
        boolean: [
            'version',
            'help',
        ],
        alias: {
            r: 'require',
            v: 'version',
            f: 'format',
            h: 'help',
        },
        default: {
            require: [],
            format: 'progress-bar',
        },
    });
    
    if (args.version) {
        stdout.write(`v${require('../package').version}\n`);
        return OK;
    }
    
    if (args.help) {
        const help = await simport('./help.js');
        stdout.write(help());
        return OK;
    }
    
    for (const module of args.require)
        await simport(resolve(module, {
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
        isStop,
    });
    
    supertape.createStream().pipe(stdout);
    
    const promises = [];
    const files = removeDuplicates(allFiles);
    
    for (const file of files) {
        promises.push(simport(resolvePath(cwd, file)));
    }
    
    filesCount(files.length);
    
    if (!promises.length)
        return OK;
    
    await Promise.all(promises);
    const [{failed}] = await once(supertape.run(), 'end');
    
    return failed;
}

module.exports._filesCount = filesCount;

