'use strict';

const addSpaces = (a) => `      ${a}`;

const REASON_USER = 1;
const REASON_ASSERT = 2;

module.exports.parseAt = (stack, {reason}) => {
    const lines = stack.split('\n');
    const line = lines[reason === 'user' ? REASON_USER : REASON_ASSERT];
    
    return line.trim().replace('at', 'at:');
};

module.exports.addSpaces = addSpaces;
module.exports.formatOutput = (str) => {
    return str
        .split('\n')
        .map(addSpaces)
        .join('\n');
};

