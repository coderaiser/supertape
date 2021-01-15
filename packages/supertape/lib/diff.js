'use strict';

const diff = require('jest-diff').default;
const strip = require('strip-ansi');

const {formatOutput, addSpaces} = require('./format');

module.exports = (a, b) => {
    const diffed = diff(a, b);
    
    let striped = diffed;
    
    if (diffed.includes('\n'))
        striped = diffed
            .split('\n')
            .slice(3)
            .join('\n');
    
    if (strip(diffed) === 'Compared values have no visual difference.')
        return '';
    
    const output = [
        addSpaces('diff: |-'),
        formatOutput(striped),
    ];
    
    return output.join('\n');
};

