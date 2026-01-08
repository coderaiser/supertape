import {stdout} from 'node:process';
import {EventEmitter} from 'node:events';
import runTests from './run-tests.js';

export const createEmitter = (overrides = {}) => {
    const {
        quiet,
        stream = stdout,
        format,
        getOperators,
        isStop,
        readyFormatter,
        workerFormatter,
        createFormatter,
        loop,
        isDebug,
    } = overrides;
    
    const tests = [];
    const emitter = new EventEmitter();
    
    emitter.on('test', (message, fn, {skip, only, extensions, at, validations, timeout}) => {
        tests.push({
            message,
            fn,
            skip,
            only,
            extensions,
            at,
            validations,
            timeout,
        });
    });
    
    emitter.on('loop', () => {
        loop({
            emitter,
            tests,
        });
    });
    
    emitter.on('run', async () => {
        const {harness, formatter} = readyFormatter || await createFormatter(format);
        
        if (!quiet)
            harness.pipe(stream);
        
        const operators = await getOperators();
        
        const result = await runTests(tests, {
            formatter: workerFormatter || formatter,
            operators,
            isStop,
            isDebug,
        });
        
        emitter.emit('end', result);
    });
    
    return emitter;
};
