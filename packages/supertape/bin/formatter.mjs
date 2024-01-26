import {EventEmitter} from 'node:events';

export const createFormatter = (parentPort) => {
    const formatter = new EventEmitter();
    
    formatter.on('start', ({total}) => {
        parentPort.postMessage(['start', {
            total,
        }]);
    });
    
    formatter.on('test', ({test}) => {
        parentPort.postMessage(['test', {
            test,
        }]);
    });
    
    formatter.on('test:end', ({count, total, failed, test}) => {
        parentPort.postMessage(['test:end', {
            total,
            count,
            failed,
            test,
        }]);
    });
    
    formatter.on('comment', (message) => {
        parentPort.postMessage(['test:end', {
            message,
        }]);
    });
    
    formatter.on('test:success', ({count, message}) => {
        parentPort.postMessage(['test:success', {
            count,
            message,
        }]);
    });
    
    formatter.on('test:fail', ({at, count, message, operator, result, expected, output, errorStack}) => {
        parentPort.postMessage(['fail', {
            at,
            count,
            message,
            operator,
            result: JSON.stringify(result),
            expected: JSON.stringify(expected),
            output,
            errorStack,
        }]);
    });
    
    formatter.on('end', ({count, passed, failed, skiped}) => {
        parentPort.postMessage(['end', {
            count,
            passed,
            failed,
            skiped,
        }]);
    });
    
    return formatter;
};
