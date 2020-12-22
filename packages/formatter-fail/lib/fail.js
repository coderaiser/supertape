'use strict';

const tap = require('@supertape/formatter-tap');
const {
    start,
    comment,
    end,
} = tap;

const fullstore = require('fullstore');
const testStore = fullstore();

function test({message}) {
    testStore(message);
    return '';
}

function fail(...a) {
    const message = testStore();
    const fail = tap.fail(...a);
    
    return `# ${message}\n${fail}`;
}

module.exports = {
    start,
    test,
    comment,
    fail,
    end,
};

