'use strict';

const {Readable} = require('stream');

module.exports.TapeReader = class TapeReader extends Readable {
    constructor(options) {
        super(options);
        const {emitter} = options;
        
        this._emitter = emitter;
    }
    
    _read() {
        this._emitter.on('line', (line) => {
            this.push(line);
        });
        
        this._emitter.on('end', () => {
            this.push(null);
        });
    }
};
