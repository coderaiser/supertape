'use strict';

const {stringify} = require('flatted');
const isError = (a) => a instanceof Error;
const SPLITTER = '>[supertape-splitter]<';
const CONSOLE_LOG = 'console:log';
const CONSOLE_ERROR = 'console:error';

module.exports.CONSOLE_ERROR = CONSOLE_ERROR;
module.exports.CONSOLE_LOG = CONSOLE_LOG;
module.exports.SPLITTER = SPLITTER;

module.exports.overrideConsoleLog = (parentPort, {console = globalThis.console} = {}) => {
    const {log} = console;
    
    console.log = createConsoleMethod(CONSOLE_LOG, parentPort);
    return {
        getBackConsoleLog: () => {
            console.log = log;
        },
    };
};

module.exports.overrideConsoleError = (parentPort, {console = globalThis.console} = {}) => {
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

module.exports._createConsoleLog = createConsoleMethod;
