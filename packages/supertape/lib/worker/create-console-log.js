import {stringify} from 'flatted';

const isError = (a) => a instanceof Error;

export const SPLITTER = '>[supertape-splitter]<';
export const CONSOLE_LOG = 'console:log';
export const CONSOLE_ERROR = 'console:error';

export const overrideConsoleLog = (parentPort, {console = globalThis.console} = {}) => {
    const {log} = console;
    
    console.log = createConsoleMethod(CONSOLE_LOG, parentPort);
    return {
        getBackConsoleLog: () => {
            console.log = log;
        },
    };
};

export const overrideConsoleError = (parentPort, {console = globalThis.console} = {}) => {
    const {error} = console;
    
    console.error = createConsoleMethod(CONSOLE_ERROR, parentPort);
    return {
        getBackConsoleError: () => {
            console.error = error;
        },
    };
};

const createConsoleMethod = (type, parentPort) => (...messages) => {
    const prepared = [];
    
    for (const message of messages) {
        if (isError(message)) {
            prepared.push(stringify(message.toString()));
            continue;
        }
        
        prepared.push(stringify(message));
    }
    
    parentPort.postMessage([
        type, {
            message: prepared.join(SPLITTER),
        },
    ]);
};

export const _createConsoleLog = createConsoleMethod;
