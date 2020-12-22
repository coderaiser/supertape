'use strict';

const {Writable} = require('stream');

const cliProgress = require('cli-progress');
const chalk = require('chalk');
const once = require('once');
const fullstore = require('fullstore');

const OK = '👌';
const {red} = chalk;
const formatErrorsCount = (a) => a ? red(a) : OK;

const isStr = (a) => typeof a === 'string';
const out = createOutput();
const store = fullstore();

const {stderr} = process;
const {
    SUPERTAPE_NO_PROGRESS_BAR,
    SUPERTAPE_PROGRESS_BAR_COLOR,
} = process.env;

let bar;

module.exports.start = ({total}) => {
    out('TAP version 13');
    
    const color = SUPERTAPE_PROGRESS_BAR_COLOR || '#f9d472';
    
    bar = createProgress({
        total,
        color,
        message: '',
    });
};

module.exports.test = ({message}) => {
    store(`# ${message}`);
};

module.exports.testEnd = ({index, total, failed, message}) => {
    bar.increment({
        index,
        total,
        message,
        failed: formatErrorsCount(failed),
    });
};

module.exports.fail = ({at, count, message, operator, actual, expected, output, errorStack}) => {
    out('');
    out(store());
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
};

module.exports.end = ({count, passed, failed, skiped}) => {
    bar.stop();
    
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
    
    return `\r${out()}`;
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

const getColorFn = (color) => {
    if (/^#/.test(color))
        return chalk.hex(color);
    
    return chalk[color];
};

const getStream = () => SUPERTAPE_NO_PROGRESS_BAR ? new Writable() : stderr;
module.exports._getStream = getStream;

const createProgress = once(({total, color, message}) => {
    const colorFn = getColorFn(color);
    const bar = new cliProgress.SingleBar({
        format: `${colorFn('{bar}')} {percentage}% | {failed} | {index}/{total} | {message}`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        clearOnComplete: true,
        stopOnComplete: true,
        stream: getStream(),
    }, cliProgress.Presets.react);
    
    bar.start(total, 0, {
        message,
        total,
        index: 0,
        failed: OK,
    });
    
    return bar;
});

