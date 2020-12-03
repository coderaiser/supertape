'use strict';

const addSpaces = (a) => `      ${a}`;

module.exports.addSpaces = addSpaces;
module.exports.formatOutput = (str) => {
    return str
        .split('\n')
        .map(addSpaces)
        .join('\n');
};

