import {EventEmitter} from 'node:events';
import {parentPort, workerData} from 'node:worker_threads';

const {assign} = Object;
const returns = (a) => () => a;

export const createCommunication = (argv) => {
    if (parentPort)
        return {
            parentPort,
            workerData,
            isMaster: returns(false),
        };
    
    const {newWorker, newParentPort} = fakeWorkers();
    
    return {
        worker: newWorker,
        parentPort: newParentPort,
        workerData: argv,
        isMaster: returns(true),
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
