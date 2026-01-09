import {test, stub} from 'supertape';
import {stringify} from 'flatted';
import {
    overrideConsoleLog,
    CONSOLE_LOG,
    overrideConsoleError,
} from './create-console-log.js';

test('supertape: worker: create-console-log', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const parentPort = {
        postMessage: stub(),
    };
    
    overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.log('hello');
    
    t.notCalled(log);
    t.end();
});

test('supertape: worker: create-console-log: get back', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const parentPort = {
        postMessage: stub(),
    };
    
    const {getBackConsoleLog} = overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.log('hello');
    
    getBackConsoleLog();
    
    consoleStub.log('world');
    
    t.calledWith(log, ['world']);
    t.end();
});

test('supertape: worker: create-console-log: get back: consoleError', (t) => {
    const error = stub();
    const consoleStub = {
        error,
    };
    
    const parentPort = {
        postMessage: stub(),
    };
    
    const {getBackConsoleError} = overrideConsoleError(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.error('hello');
    
    getBackConsoleError();
    
    consoleStub.error('world');
    
    t.calledWith(error, ['world']);
    t.end();
});

test('supertape: worker: create-console-log: postMessage', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const postMessage = stub();
    
    const parentPort = {
        postMessage,
    };
    
    overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.log('hello');
    
    const arg = [
        CONSOLE_LOG, {
            message: '["hello"]',
        },
    ];
    
    t.calledWith(postMessage, [arg]);
    t.end();
});

test('supertape: worker: create-console-log: postMessage: array', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const postMessage = stub();
    
    const parentPort = {
        postMessage,
    };
    
    const {getBackConsoleLog} = overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.log([1, 2]);
    
    getBackConsoleLog();
    
    const arg = [
        CONSOLE_LOG, {
            message: '[[1,2]]',
        },
    ];
    
    t.calledWith(postMessage, [arg]);
    t.end();
});

test('supertape: worker: create-console-log: postMessage: object', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const postMessage = stub();
    
    const parentPort = {
        postMessage,
    };
    
    overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    const objectB = {};
    
    const objectA = {
        objectB,
    };
    
    objectA.objectB = {
        objectA,
    };
    
    consoleStub.log(objectA);
    
    const arg = [
        CONSOLE_LOG, {
            message: stringify(objectA),
        },
    ];
    
    t.calledWith(postMessage, [arg]);
    t.end();
});

test('supertape: worker: create-console-log: postMessage: simple object', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const postMessage = stub();
    
    const parentPort = {
        postMessage,
    };
    
    overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.log({
        hello: 'world',
    });
    
    const arg = [
        CONSOLE_LOG, {
            message: '[{"hello":"1"},"world"]',
        },
    ];
    
    t.calledWith(postMessage, [arg]);
    t.end();
});

test('supertape: worker: create-console-log: postMessage: error', (t) => {
    const log = stub();
    const consoleStub = {
        log,
    };
    
    const postMessage = stub();
    
    const parentPort = {
        postMessage,
    };
    
    overrideConsoleLog(parentPort, {
        console: consoleStub,
    });
    
    consoleStub.log(Error('hello'));
    
    const arg = [
        CONSOLE_LOG, {
            message: '["Error: hello"]',
        },
    ];
    
    t.calledWith(postMessage, [arg]);
    t.end();
});
