import {
    parentPort,
    workerData,
} from 'node:worker_threads';
import {EventEmitter} from 'node:events';

const {assign} = Object;

export const createCommunication = (argv) => {
    if (parentPort)
        return {
            parentPort,
            workerData,
        };
    
    const {newWorker, newParentPort} = fakeWorkers();
    
    return {
        worker: newWorker,
        parentPort: newParentPort,
        workerData: argv,
    };
};

export function fakeWorkers() {
    const newWorker = new EventEmitter();
    const newParentPort = new EventEmitter();
    
    assign(newWorker, {
        postMessage: (a) => {
            newParentPort.emit('message', a);
        },
    });
    
    assign(newParentPort, {
        postMessage: (a) => {
            newWorker.emit('message', a);
        },
    });
    
    return {
        newParentPort,
        newWorker,
    };
}
