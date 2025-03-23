'use strict';

const {EventEmitter} = require('node:events');
const {createHarness} = require('./harness');

const resolveFormatter = async (name) => await import(`@supertape/formatter-${name}`);
const isString = (a) => typeof a === 'string';

module.exports.createFormatter = async (name) => {
    const formatter = new EventEmitter();
    const harness = createHarness(!isString(name) ? name : await resolveFormatter(name));
    
    formatter.on('start', ({total}) => {
        harness.write({
            type: 'start',
            total,
        });
    });
    
    formatter.on('test', ({test}) => {
        harness.write({
            type: 'test',
            test,
        });
    });
    
    formatter.on('test:end', ({count, total, failed, test}) => {
        harness.write({
            type: 'test:end',
            total,
            count,
            failed,
            test,
        });
    });
    
    formatter.on('comment', (message) => {
        harness.write({
            type: 'comment',
            message,
        });
    });
    
    formatter.on('test:success', ({count, message}) => {
        harness.write({
            type: 'success',
            count,
            message,
        });
    });
    
    formatter.on('test:fail', ({at, count, message, operator, result, expected, output, errorStack}) => {
        harness.write({
            type: 'fail',
            at,
            count,
            message,
            operator,
            result,
            expected,
            output,
            errorStack,
        });
    });
    
    formatter.on('end', ({count, passed, failed, skipped}) => {
        harness.write({
            type: 'end',
            count,
            passed,
            failed,
            skipped,
        });
    });
    
    return {
        formatter,
        harness,
    };
};
