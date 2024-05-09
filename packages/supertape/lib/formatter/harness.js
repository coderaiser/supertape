'use strict';

const {Transform: _Transform} = require('stream');
const {assign} = Object;

module.exports.createHarness = (reporter, {Transform = _Transform} = {}) => {
    const prepared = prepare(reporter);
    const stream = new Transform({
        writableObjectMode: true,
        
        transform(chunk, encoding, callback) {
            const {type, ...data} = chunk;
            const result = run(prepared, type, data);
            
            if (this._ended)
                return callback(Error(`☝️ Looks like 'async' operator called without 'await'`));
            
            if (result)
                this.push(result);
            
            if (type === 'end') {
                this._ended = true;
                this.push(null);
            }
            
            callback();
        },
    });
    
    return stream;
};

const stub = () => {};

function prepare(reporter) {
    const result = {};
    
    assign(result, {
        start: stub,
        test: stub,
        testEnd: stub,
        fail: stub,
        success: stub,
        comment: stub,
        end: stub,
        ...reporter.createFormatter?.() || reporter,
    });
    
    return result;
}

function run(reporter, type, data) {
    if (type === 'start')
        return reporter.start(data);
    
    if (type === 'test')
        return reporter.test(data);
    
    if (type === 'test:end')
        return reporter.testEnd(data);
    
    if (type === 'comment')
        return reporter.comment(data);
    
    if (type === 'success')
        return reporter.success(data);
    
    if (type === 'fail')
        return reporter.fail(data);
    
    if (type === 'end')
        return reporter.end(data);
}
