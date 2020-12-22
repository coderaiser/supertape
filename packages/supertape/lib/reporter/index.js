'use strict';

const {EventEmitter} = require('events');
const {createHarness} = require('./harness');

const resolveFormatter = (name) => {
    return require(`${__dirname}/${name}`);
};

module.exports.createReporter = (name) => {
    const reporter = new EventEmitter();
    const formatter = resolveFormatter(name);
    const harness = createHarness(formatter);
    
    reporter.on('start', ({total}) => {
        harness.write({
            type: 'start',
            total,
        });
    });
    
    reporter.on('test', ({message}) => {
        harness.write({
            type: 'test',
            message,
        });
    });
    
    reporter.on('test:end', ({index, total, failed, message}) => {
        harness.write({
            type: 'test:end',
            total,
            index,
            failed,
            message,
        });
    });
    
    reporter.on('comment', (message) => {
        harness.write({
            type: 'comment',
            message,
        });
    });
    
    reporter.on('test:success', ({count, message}) => {
        harness.write({
            type: 'success',
            count,
            message,
        });
    });
    
    reporter.on('test:fail', ({at, count, message, operator, actual, expected, output, errorStack}) => {
        harness.write({
            type: 'fail',
            at,
            count,
            message,
            operator,
            actual,
            expected,
            output,
            errorStack,
        });
    });
    
    reporter.on('end', ({count, passed, failed, skiped}) => {
        harness.write({
            type: 'end',
            count,
            passed,
            failed,
            skiped,
        });
    });
    
    return {
        reporter,
        harness,
    };
};

