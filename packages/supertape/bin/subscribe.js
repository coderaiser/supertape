import {keypress} from '@putout/cli-keypress';
import {parse} from 'flatted';
import * as harnessCreator from '../lib/formatter/harness.js';
import {
    SPLITTER,
    CONSOLE_LOG,
    CONSOLE_ERROR,
} from '../lib/worker/create-console-log.js';

const one = (fn) => (a) => fn(a);

const maybeParse = (a) => a && parse(a);
const {createHarness} = harnessCreator;
const resolveFormatter = async (name) => await import(`@supertape/formatter-${name}`);

export async function subscribe({name, exit, worker, stdout}) {
    const {isStop} = keypress();
    const harness = createHarness(await resolveFormatter(name));
    
    harness.pipe(stdout);
    
    worker.on('exit', (code) => {
        exit(code);
    });
    
    worker.on('message', ([type, a]) => {
        if (type === CONSOLE_LOG)
            return consoleLog(a);
        
        if (type === CONSOLE_ERROR)
            return consoleError(a);
        
        harness.write({
            type,
            ...a,
        });
        
        if (isStop())
            worker.postMessage(['stop']);
    });
}

export function consoleLog({message, logger = console}) {
    const messages = message
        .split(SPLITTER)
        .map(one(maybeParse));
    
    logger.log(...messages);
}

export function consoleError({message, logger = console}) {
    const messages = message
        .split(SPLITTER)
        .map(one(maybeParse));
    
    logger.error(...messages);
}
