export const addSpaces = (a) => `      ${a}`;

const REASON_USER = 3;

export const parseAt = (stack) => {
    const lines = stack.split('\n');
    
    if (lines.length === 1)
        return stack;
    
    if (lines.length > 10 && lines[0].startsWith('Error: '))
        return lines[REASON_USER] || lines[0];
    
    const line = lines[REASON_USER];
    
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
