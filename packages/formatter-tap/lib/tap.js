'use strict';

const isStr = (a) => typeof a === 'string';

module.exports.start = () => {
    return 'TAP version 13\n';
};

module.exports.test = ({test}) => {
    return `# ${test}\n`;
};

module.exports.comment = ({message}) => {
    return `# ${message}\n`;
};

module.exports.success = ({count, message}) => {
    return `ok ${count} ${message}\n`;
};

module.exports.fail = ({at, count, message, operator, actual, expected, output, errorStack}) => {
    const out = createOutput();
    
    out(`not ok ${count} ${message}`);
    out('  ---');
    out(`    operator: ${operator}`);
    
    if (output)
        out(output);
    
    if (!isStr(output)) {
        out('    expected: |-');
        out(`      ${expected}`);
        out('    actual: |-');
        out(`      ${actual}`);
    }
    
    out(`    ${at}`);
    out('    stack: |-');
    out(errorStack);
    out('  ...');
    out('');
    
    return out();
};

module.exports.end = ({count, passed, failed, skiped}) => {
    const out = createOutput();
    
    out('');
    
    out(`1..${count}`);
    out(`# tests ${count}`);
    out(`# pass ${passed}`);
    
    if (skiped) {
        out(`# skip ${skiped}`);
    }
    
    if (failed) {
        out(`# fail ${failed}`);
    }
    
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

