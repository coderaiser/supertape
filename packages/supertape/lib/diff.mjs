import {diff} from 'jest-diff';
import strip from 'strip-ansi';
import {
    formatOutput,
    addSpaces,
} from './format.js';

export default (a, b) => {
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
