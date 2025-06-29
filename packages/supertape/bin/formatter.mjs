import {EventEmitter} from 'node:events';
import {JSONStringify} from 'json-with-bigint';

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
    
    formatter.on('comment', ({message}) => {
        parentPort.postMessage(['comment', {
            message,
        }]);
    });
    
    formatter.on('test:success', ({count, message}) => {
        parentPort.postMessage(['success', {
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
            result: JSONStringify(result),
            expected: JSONStringify(expected),
            output,
            errorStack,
        }]);
    });
    
    formatter.on('end', ({count, passed, failed, skipped}) => {
        parentPort.postMessage(['end', {
            count,
            passed,
            failed,
            skipped,
        }]);
    });
    
    return formatter;
};
