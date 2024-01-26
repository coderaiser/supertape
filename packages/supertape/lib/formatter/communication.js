'use strict';

const {parentPort, workerData} = require('node:worker_threads');

const {EventEmitter} = require('node:events');
const process = require('node:process');

const {assign} = Object;

module.exports.createCommunication = () => {
    if (parentPort)
        return {
            parentPort,
            workerData,
        };
    
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
        worker: newWorker,
        parentPort: newParentPort,
        workerData: process.argv,
    };
};
