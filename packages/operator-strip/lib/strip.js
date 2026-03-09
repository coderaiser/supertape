import {stripVTControlCharacters} from 'node:util';

const trimEnd = (a) => a.trimEnd();
const trim = (a) => a.trim();

export const stripEqual = (operator) => (a, b) => {
    const result = stripVTControlCharacters(a)
        .split('\n')
        .map(trim)
        .filter(Boolean)
        .join('\n');
    
    return operator.equal(result, b);
};

export const stripEndEqual = (operator) => (a, b) => {
    const result = stripVTControlCharacters(a)
        .split('\n')
        .map(trimEnd)
        .filter(Boolean)
        .join('\n');
    
    return operator.equal(result, b);
};
