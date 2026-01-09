import {stripVTControlCharacters} from 'node:util';
import {diff} from 'jest-diff';
import {formatOutput, addSpaces} from './format.js';

export default (a, b) => {
    const diffed = diff(a, b)
        .replaceAll('Object ', '')
        .replaceAll('Array ', '');
    
    let striped = diffed;
    
    if (diffed.includes('\n'))
        striped = diffed
            .split('\n')
            .slice(3)
            .join('\n');
    
    if (stripVTControlCharacters(diffed) === 'Compared values have no visual difference.')
        return '';
    
    const output = [
        addSpaces('diff: |-'),
        formatOutput(striped),
    ];
    
    return output.join('\n');
};
