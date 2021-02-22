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
const {
    OK,
    FAIL,
    WAS_STOP,
    UNHANDLED,
    INVALID_OPTION,
} = require('./exit-codes');

const {resolve} = require;
const {isArray} = Array;

const maybeFirst = (a) => isArray(a) ? a.pop() : a;
const maybeArray = (a) => isArray(a) ? a : [a];

const removeDuplicates = (a) => Array.from(new Set(a));
const filesCount = fullstore(0);

module.exports = async ({argv, cwd, stdout, stderr, exit}) => {
    const {isStop} = keypress();
    const [error, result] = await tryToCatch(cli, {
        argv,
        cwd,
        stdout,
        exit,
        isStop,
    });
    
    if (error) {
        stderr.write(error.stack);
        return exit(UNHANDLED);
    }
    
    const {
        failed,
        code,
        message,
    } = result;
    
    if (failed) {
        return exit(FAIL);
    }
    
    if (code === INVALID_OPTION) {
        stderr.write(`${message}\n`);
        return exit(code);
    }
    
    if (isStop())
        return exit(WAS_STOP);
    
    return exit(OK);
};

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
    ],
    alias: {
        version: 'v',
        format: 'f',
        help: 'h',
        require: 'r',
    },
    default: {
        format: 'progress-bar',
        require: [],
    },
};

async function cli({argv, cwd, stdout, isStop}) {
    const args = yargsParser(argv, yargsOptions);
    
    if (args.version) {
        stdout.write(`v${require('../package').version}\n`);
        return OK;
    }
    
    if (args.help) {
        const help = await simport('./help.js');
        stdout.write(help());
        return OK;
    }
    
    const validateArgs = require('@putout/cli-validate-args');
    
    const error = await validateArgs(args, [
        ...yargsOptions.boolean,
        ...yargsOptions.string,
    ]);
    
    if (error)
        return {
            code: INVALID_OPTION,
            message: error.message,
        };
    
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
    
    return {
        failed,
    };
}

module.exports._filesCount = filesCount;

