'use strict';

const {resolve: resolvePath} = require('node:path');
const {once} = require('node:events');
const {pathToFileURL} = require('node:url');

const {env} = require('node:process');
const fullstore = require('fullstore');
const {tryToCatch} = require('try-to-catch');
const {keypress: _keypress} = require('@putout/cli-keypress');

const {sync: _globSync} = require('glob');

const {
    parseArgs,
    getYargsOptions,
} = require('./cli/parse-args');

const _supertape = require('..');

const {
    OK,
    FAIL,
    WAS_STOP,
    UNHANDLED,
    INVALID_OPTION,
    SKIPPED,
} = require('./exit-codes');

const filesCount = fullstore(0);
const removeDuplicates = (a) => Array.from(new Set(a));
const isExclude = (a) => !a.includes('node_modules');

module.exports = async (overrides = {}) => {
    const {
        argv,
        cwd,
        stdout,
        stderr,
        exit,
        workerFormatter,
        keypress = _keypress,
        supertape = _supertape,
        globSync = _globSync,
    } = overrides;
    
    const {
        SUPERTAPE_CHECK_SKIPPED = '0',
    } = env;
    
    const isStop = overrides.isStop || keypress().isStop;
    
    const [error, result] = await tryToCatch(_cli, {
        supertape,
        argv,
        cwd,
        stdout,
        exit,
        isStop,
        workerFormatter,
        globSync,
    });
    
    if (error) {
        stderr.write(error.stack);
        return exit(UNHANDLED);
    }
    
    const {
        failed,
        code,
        message,
        skipped,
    } = result;
    
    if (isStop())
        return exit(WAS_STOP);
    
    if (Number(SUPERTAPE_CHECK_SKIPPED) && skipped)
        return exit(SKIPPED);
    
    if (failed)
        return exit(FAIL);
    
    if (code === INVALID_OPTION) {
        stderr.write(`${message}\n`);
        return exit(code);
    }
    
    return exit(OK);
};

async function _cli(overrides) {
    const {
        argv,
        cwd,
        stdout,
        isStop,
        workerFormatter,
        supertape,
        globSync,
    } = overrides;
    
    const args = parseArgs(argv);
    
    if (args.version) {
        stdout.write(`v${require('../package').version}\n`);
        return OK;
    }
    
    if (args.help) {
        const {help} = await import('./help.js');
        stdout.write(help());
        
        return OK;
    }
    
    const {validateArgs} = await import('@putout/cli-validate-args');
    
    const {boolean, string} = getYargsOptions();
    
    const error = await validateArgs(args, [
        ...boolean,
        ...string,
    ]);
    
    if (error)
        return {
            code: INVALID_OPTION,
            message: error.message,
        };
    
    for (const module of args.require)
        await import(module);
    
    const allFiles = [];
    
    for (const arg of args._) {
        const files = globSync(arg).filter(isExclude);
        
        allFiles.push(...files);
    }
    
    const {
        format,
        checkDuplicates,
        checkScopes,
        checkAssertionsCount,
    } = args;
    
    supertape.init({
        run: false,
        quiet: true,
        format,
        isStop,
        checkDuplicates,
        checkScopes,
        checkAssertionsCount,
        workerFormatter,
    });
    
    const stream = await supertape.createStream();
    
    stream.pipe(stdout);
    
    const files = removeDuplicates(allFiles);
    
    filesCount(files.length);
    
    if (!files.length)
        return OK;
    
    const resolvedNames = [];
    
    // always resolve before import for windows
    for (const file of files) {
        resolvedNames.push(pathToFileURL(resolvePath(cwd, file)));
    }
    
    for (const resolved of resolvedNames)
        await import(resolved);
    
    const [result] = await once(supertape.run(), 'end');
    
    return result;
}

module.exports._filesCount = filesCount;
