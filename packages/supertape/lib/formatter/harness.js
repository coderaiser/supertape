'use strict';

const tryCatch = require('try-catch');
const {Transform} = require('stream');
const {assign} = Object;

module.exports.createHarness = (reporter, {push} = {}) => {
    const prepared = prepare(reporter);
    
    const stream = new Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        
        transform(chunk, encoding, callback) {
            const superPush = push || this.push.bind(this);
            
            let {type, ...data} = chunk;
            const result = run(prepared, type, data);
            
            if (result) {
                const [error] = tryCatch(superPush, result);
                type = !error ? type : 'end';
            }
            
            if (type === 'end')
                this.push(null);
            
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
        ...reporter,
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
    
    return reporter.end(data);
}

