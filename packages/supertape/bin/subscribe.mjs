import keyPress from '@putout/cli-keypress';
import harnessCreator from '../lib/formatter/harness.js';

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
        harness.write({
            type,
            ...a,
        });
        
        if (isStop())
            worker.postMessage(['stop']);
    });
}
