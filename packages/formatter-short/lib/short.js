const isStr = (a) => typeof a === 'string';

export const start = () => 'TAP version 13\n';

export const test = ({test}) => {
    return `# ${test}\n`;
};

export const comment = ({message}) => {
    return `# ${message}\n`;
};

export const success = ({count, message}) => {
    return `ok ${count} ${message}\n`;
};

export const fail = ({at, count, message, operator, result, expected, output}) => {
    const out = createOutput();
    
    out(`not ok ${count} ${message}`);
    out('  ---');
    out(`    operator: ${operator}`);
    
    if (output)
        out(output);
    
    if (!isStr(output)) {
        out('    expected: |-');
        out(`      ${expected}`);
        out('    result: |-');
        out(`      ${result}`);
    }
    
    out(`    ${at}`);
    out('  ...');
    out('');
    
    return out();
};

export const end = ({count, passed, failed, skipped}) => {
    const out = createOutput();
    
    out('');
    
    out(`1..${count}`);
    out(`# tests ${count}`);
    out(`# pass ${passed}`);
    
    if (skipped)
        out(`# skip ${skipped}`);
    
    if (failed)
        out(`# fail ${failed}`);
    
    out('');
    
    if (!failed) {
        out('# ok');
        out('');
    }
    
    out('');
    
    return out();
};

function createOutput() {
    const output = [];
    
    return (...args) => {
        const [line] = args;
        
        if (!args.length)
            return output.join('\n');
        
        output.push(line);
    };
}
