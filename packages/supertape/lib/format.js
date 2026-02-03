export const addSpaces = (a) => `      ${a}`;

const REASON_USER = 3;
const REASON_EXCEPTION = 1;

export const parseAt = (stack, {reason}) => {
    const lines = cutMockImport(stack).split('\n');
    
    if (lines.length === 1)
        return stack;
    
    if (lines.length > 10 && lines[0].startsWith('Error: '))
        return lines[REASON_USER] || lines[0];
    
    const line = lines[reason === 'user' ? REASON_USER : REASON_EXCEPTION];
    
    if (!line)
        throw Error(`☝️ Looks like 'async' operator called without 'await': ${stack}`);
    
    return line.trim();
};

export const formatOutput = (str) => {
    return str
        .split('\n')
        .map(addSpaces)
        .join('\n');
};

function cutMockImport(str) {
    return str.replace(/\?mock-import-count=\d+/g, '');
}
