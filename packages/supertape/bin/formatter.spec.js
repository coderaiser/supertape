import {createFormatter} from './formatter.js';
import {test, stub} from '../lib/supertape.js';

test('supertape: bin: formatter: success', (t) => {
    const postMessage = stub();
    const parentPort = {
        postMessage,
    };
    
    const formatter = createFormatter(parentPort);
    
    const emit = formatter.emit.bind(formatter);
    emit('test:success', {
        count: 1,
        message: 'hello',
    });
    
    const expected = [
        ['success', {
            count: 1,
            message: 'hello',
        }],
    ];
    
    t.calledWith(postMessage, expected);
    t.end();
});

test('supertape: bin: formatter: comment', (t) => {
    const postMessage = stub();
    const parentPort = {
        postMessage,
    };
    
    const formatter = createFormatter(parentPort);
    
    const emit = formatter.emit.bind(formatter);
    emit('comment', {
        message: 'hello',
    });
    
    const expected = [
        ['comment', {
            message: 'hello',
        }],
    ];
    
    t.calledWith(postMessage, expected);
    t.end();
});

test('supertape: bin: formatter: fail', (t) => {
    const postMessage = stub();
    const parentPort = {
        postMessage,
    };
    
    const formatter = createFormatter(parentPort);
    
    const emit = formatter.emit.bind(formatter);
    emit('test:fail', {
        count: 1,
        result: 1n,
        expected: 2,
        message: 'hello',
    });
    
    const expected = [
        ['fail', {
            at: undefined,
            count: 1,
            errorStack: undefined,
            expected: '2',
            message: 'hello',
            operator: undefined,
            output: undefined,
            result: '1',
        }],
    ];
    
    t.calledWith(postMessage, expected);
    t.end();
});
