'use strict';

const diff = require('jest-diff').default;
const {formatOutput, addSpaces} = require('./format');

module.exports.showDiff = function showDiff(a, b) {
    const diffed = diff(b, a);
    
    const striped = diffed
        .split('\n')
        .slice(3)
        .join('\n');
    
    const output = [
        addSpaces('diff: |-'),
        formatOutput(striped),
    ];
    
    return output.join('\n');
};

