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

const resolveBeforeImportForWindows = ({cwd, file}) => pathToFileURL(resolvePath(cwd, file));

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
        stderr,
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
    
    if (failed)
        return exit(FAIL);
    
    if (Number(SUPERTAPE_CHECK_SKIPPED) && skipped)
        return exit(SKIPPED);
    
    if (code === FAIL)
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
        stderr,
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
    const notFound = [];
    
    for (const arg of args._) {
        const found = globSync(arg);
        
        // A pattern that matched nothing at all, as opposed to one whose matches
        // were all filtered out - excluding node_modules is the second, and that
        // is the exclusion working, not a miss.
        if (!found.length)
            notFound.push(arg);
        
        allFiles.push(...found.filter(isExclude));
    }
    
    if (notFound.length)
        stderr.write(`No files matched: ${notFound.join(', ')}\n`);
    
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
    
    if (!files.length) {
        // every pattern matched nothing, so there is no test run to report on and
        // exiting 0 would pass a gate that checked nothing. No pattern at all is a
        // different thing: nothing was asked for, so there is nothing to fail.
        if (args._.length && notFound.length === args._.length)
            return {
                code: FAIL,
            };
        
        return OK;
    }
    
    const stream = await supertape.createStream();
    stream.pipe(stdout);
    
    const resolvedNames = [];
    
    for (const file of files) {
        resolvedNames.push(resolveBeforeImportForWindows({
            cwd,
            file,
        }));
    }
    
    if (!args.dryRun)
        for (const resolved of resolvedNames)
            await import(resolved);
    
    const [result] = await once(supertape.run(), 'end');
    
    return result;
}

export const _filesCount = filesCount;
