'use strict';

const addSpaces = (a) => `      ${a}`;

const REASON_USER = 3;
const REASON_EXCEPTION = 1;

module.exports.parseAt = (stack, {reason}) => {
    const lines = cutMockImport(stack).split('\n');
    
    if (lines.length === 1)
        return stack;
    
    const line = lines[reason === 'user' ? REASON_USER : REASON_EXCEPTION];
    
    if (!line)
        throw Error(`☝️ Looks like 'async' operator called without 'await': ${stack}`);
    
    return line.trim();
};

module.exports.addSpaces = addSpaces;
module.exports.formatOutput = (str) => {
    return str
        .split('\n')
        .map(addSpaces)
        .join('\n');
};

function cutMockImport(str) {
    return str.replace(/\?mock-import-count=\d+/g, '');
}
