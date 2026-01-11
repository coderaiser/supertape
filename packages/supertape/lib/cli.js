import {pathToFileURL} from 'node:url';
import {resolve as resolvePath} from 'node:path';
import {once} from 'node:events';
import {env} from 'node:process';
import {createRequire} from 'node:module';
import {fullstore} from 'fullstore';
import {tryToCatch} from 'try-to-catch';
import {keypress as _keypress} from '@putout/cli-keypress';
import {sync as _globSync} from 'glob';
import {
    parseArgs,
    getYargsOptions,
} from './cli/parse-args.js';
import _supertape from './supertape.js';
import {
    OK,
    FAIL,
    WAS_STOP,
    UNHANDLED,
    INVALID_OPTION,
    SKIPPED,
} from './exit-codes.js';

const require = createRequire(import.meta.url);
const filesCount = fullstore(0);
const removeDuplicates = (a) => Array.from(new Set(a));
const isExclude = (a) => !a.includes('node_modules');

export default async (overrides = {}) => {
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
    
    const files = removeDuplicates(allFiles);
    
    filesCount(files.length);
    
    if (!files.length)
        return OK;
    
    const stream = await supertape.createStream();
    stream.pipe(stdout);
    
    const resolvedNames = [];
    
    // always resolve before import for windows
    for (const file of files) {
        resolvedNames.push(pathToFileURL(resolvePath(cwd, file)));
    }
    
    if (!args.dryRun)
        for (const resolved of resolvedNames)
            await import(resolved);
    
    const [result] = await once(supertape.run(), 'end');
    
    return result;
}

export const _filesCount = filesCount;
