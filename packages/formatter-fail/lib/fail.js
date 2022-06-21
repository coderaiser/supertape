'use strict';

const tap = require('@supertape/formatter-tap');
const fullstore = require('fullstore');

const {
    start,
    comment,
    end,
} = tap;
const testStore = fullstore();

function test({test}) {
    testStore(test);
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

