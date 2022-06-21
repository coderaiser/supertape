'use strict';

const fullstore = require('fullstore');

const out = createOutput();
const store = fullstore();

module.exports.test = ({test}) => {
    store(test);
};

const stringify = (a) => JSON.stringify(a) + '\n';

module.exports.testEnd = ({count, total, failed, test}) => {
    return stringify({
        count,
        total,
        failed,
        test,
    });
};

module.exports.fail = ({at, count, message, operator, actual, expected, output, errorStack}) => {
    const result = {
        test: store(),
        at,
        count,
        message,
        operator,
        actual,
        expected,
        errorStack,
        output,
    };
    
    return out(result);
};

module.exports.end = ({count, passed, failed, skiped}) => {
    out({
        count,
        passed,
        failed,
        skiped,
    });
    
    return out();
};

function createOutput() {
    let output = [];
    
    return (...args) => {
        const [line] = args;
        
        if (!args.length) {
            const result = output.join('');
            output = [];
            
            return result;
        }
        
        output.push(stringify(line));
    };
}

