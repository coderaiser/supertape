import keyPress from '@putout/cli-keypress';
import harnessCreator from '../lib/formatter/harness.js';
import {parse} from 'flatted';
import {
    SPLITTER,
    CONSOLE_LOG,
    CONSOLE_ERROR,
} from '../lib/worker/create-console-log.js';

const one = (fn) => (a) => fn(a);

const {createHarness} = harnessCreator;
const resolveFormatter = async (name) => await import(`@supertape/formatter-${name}`);

export async function subscribe({name, exit, worker, stdout}) {
    const {isStop} = keyPress();
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

function consoleLog({message}) {
    const messages = message
        .split(SPLITTER)
        .map(one(parse));
    
    console.log(...messages);
}

function consoleError({message}) {
    const messages = message
        .split(SPLITTER)
        .map(one(parse));
    
    console.error(...messages);
}
