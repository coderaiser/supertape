import fullstore from 'fullstore';

const out = createOutput();
const store = fullstore();

export const test = ({test}) => {
    store(test);
};

const stringify = (a) => JSON.stringify(a) + '\n';

export const testEnd = ({count, total, failed, test}) => {
    return stringify({
        count,
        total,
        failed,
        test,
    });
};

export const fail = ({at, count, message, operator, result, expected, output, errorStack}) => {
    return out({
        test: store(),
        at,
        count,
        message,
        operator,
        result,
        expected,
        errorStack,
        output,
    });
};

export const end = ({count, passed, failed, skiped}) => {
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

