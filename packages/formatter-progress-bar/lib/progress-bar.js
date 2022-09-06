'use strict';

const {Writable} = require('stream');

const cliProgress = require('cli-progress');
const chalk = require('chalk');
const once = require('once');
const fullstore = require('fullstore');
const {isCI} = require('ci-info');

const OK = '👌';
const YELLOW = '#f9d472';

const {red} = chalk;
const formatErrorsCount = (a) => a ? red(a) : OK;

const isStr = (a) => typeof a === 'string';
const out = createOutput();
const store = fullstore();

const {stderr} = process;
const {
    SUPERTAPE_PROGRESS_BAR,
    SUPERTAPE_PROGRESS_BAR_MIN = 100,
    SUPERTAPE_PROGRESS_BAR_COLOR,
    SUPERTAPE_PROGRESS_BAR_STACK = 1,
} = process.env;

let bar;

module.exports.start = ({total}) => {
    out('TAP version 13');
    
    const color = SUPERTAPE_PROGRESS_BAR_COLOR || YELLOW;
    
    bar = createProgress({
        total,
        color,
        test: '',
    });
};

module.exports.test = ({test}) => {
    store(`# ${test}`);
};

module.exports.testEnd = ({count, total, failed, test}) => {
    bar.increment({
        count,
        total,
        test,
        failed: formatErrorsCount(failed),
    });
};

module.exports.fail = ({at, count, message, operator, result, expected, output, errorStack}) => {
    out('');
    out(store());
    out(`❌ not ok ${count} ${message}`);
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
    
    if (SUPERTAPE_PROGRESS_BAR_STACK !== '0') {
        out('    stack: |-');
        out(errorStack);
    }
    
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
        out(`# ⚠️  skip ${skiped}`);
    }
    
    out('');
    
    if (failed) {
        out(`# ❌ fail ${failed}`);
    }
    
    if (!failed) {
        out('# ✅ ok');
    }
    
    out('');
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
    if (color.startsWith('#'))
        return chalk.hex(color);
    
    return chalk[color];
};

const defaultStreamOptions = {
    total: Infinity,
};

const getStream = ({total} = defaultStreamOptions) => {
    const is = total >= SUPERTAPE_PROGRESS_BAR_MIN;
    
    if (is && !isCI || SUPERTAPE_PROGRESS_BAR === '1')
        return stderr;
    
    return new Writable();
};

module.exports._getStream = getStream;

const createProgress = once(({total, color, test}) => {
    const colorFn = getColorFn(color);
    const bar = new cliProgress.SingleBar({
        format: `${colorFn('{bar}')} {percentage}% | {failed} | {count}/{total} | {test}`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        clearOnComplete: true,
        stopOnComplete: true,
        hideCursor: true,
        stream: getStream({
            total,
        }),
    }, cliProgress.Presets.react);
    
    bar.start(total, 0, {
        test,
        total,
        count: 0,
        failed: OK,
    });
    
    return bar;
});

