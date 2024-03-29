import {createFormatter} from './formatter.mjs';
import {test, stub} from '../lib/supertape.mjs';

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
