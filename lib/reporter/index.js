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
    
    reporter.on('start', () => {
        harness.write({
            type: 'start',
        });
    });
    
    reporter.on('test', (message) => {
        harness.write({
            type: 'test',
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
    
    reporter.on('test:fail', ({is, at, count, message, operator, actual, expected, output, errorStack}) => {
        harness.write({
            type: 'fail',
            is, at, count, message, operator, actual, expected, output, errorStack,
        });
    });
    
    reporter.on('end', ({count, passed, failed}) => {
        harness.write({
            type: 'end',
            count,
            passed,
            failed,
        });
    });
    
    return {
        reporter,
        harness,
    };
};

