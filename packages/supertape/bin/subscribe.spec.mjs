import {test, stub} from 'supertape';
import {consoleLog, consoleError} from './subscribe.mjs';

test('supertype: subscribe: consoleLog', (t) => {
    const log = stub();
    const logger = {
        log,
    };
    
    consoleLog({
        message: '',
        logger,
    });
    
    t.calledWith(log, ['']);
    t.end();
});

test('supertype: subscribe: consoleError', (t) => {
    const error = stub();
    const logger = {
        error,
    };
    
    consoleError({
        message: '',
        logger,
    });
    
    t.calledWith(error, ['']);
    t.end();
});
