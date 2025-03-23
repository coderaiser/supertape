import {Writable} from 'node:stream';
import process from 'node:process';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import fullstore from 'fullstore';
import {isCI} from 'ci-info';

global._isCI = isCI;

const OK = '👌';
const WARNING = '⚠️';
const YELLOW = '#f9d472';

const {red} = chalk;
const formatErrorsCount = (a) => a ? red(a) : OK;

const isStr = (a) => typeof a === 'string';
const {stderr} = process;

let SUPERTAPE_PROGRESS_BAR;
let SUPERTAPE_PROGRESS_BAR_MIN = 100;
let SUPERTAPE_PROGRESS_BAR_COLOR;
let SUPERTAPE_PROGRESS_BAR_STACK = 1;

export function createFormatter(bar) {
    ({
        SUPERTAPE_PROGRESS_BAR,
        SUPERTAPE_PROGRESS_BAR_MIN = 100,
        SUPERTAPE_PROGRESS_BAR_COLOR,
        SUPERTAPE_PROGRESS_BAR_STACK = 1,
    } = process.env);
    
    const out = createOutput();
    const store = fullstore();
    const barStore = fullstore(bar);
    
    return {
        start: start({
            barStore,
            out,
        }),
        test: test({
            store,
        }),
        testEnd: testEnd({
            barStore,
        }),
        fail: fail({
            out,
            store,
        }),
        comment: comment({
            out,
        }),
        end: end({
            barStore,
            out,
        }),
    };
}

export const start = ({barStore, out}) => ({total}) => {
    out('TAP version 13');
    
    const color = SUPERTAPE_PROGRESS_BAR_COLOR || YELLOW;
    const bar = barStore() || _createProgress({
        total,
        color,
        test: '',
    });
    
    barStore(bar);
};

export const test = ({store}) => ({test}) => {
    store(`# ${test}`);
};

export const testEnd = ({barStore}) => ({count, total, failed, test}) => {
    barStore().increment({
        count,
        total,
        test,
        failed: formatErrorsCount(failed),
    });
};

export const fail = ({out, store}) => ({at, count, message, operator, result, expected, output, errorStack}) => {
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

export const comment = ({out}) => ({message}) => {
    out(`# ${message}`);
};

export const end = ({barStore, out}) => ({count, passed, failed, skipped}) => {
    barStore().stop();
    
    out('');
    
    out(`1..${count}`);
    out(`# tests ${count}`);
    out(`# pass ${passed}`);
    
    if (skipped)
        out(formatSkip(skipped));
    
    out('');
    
    if (failed)
        out(`# ❌ fail ${failed}`);
    
    if (!failed)
        out(formatOk());
    
    out('');
    out('');
    
    return `\r${out()}`;
};

function createOutput() {
    let output = [];
    
    return (...args) => {
        const [line] = args;
        
        if (!args.length) {
            const result = output.join('\n');
            
            output = [];
            
            return result;
        }
        
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
    
    if (is && !global._isCI || SUPERTAPE_PROGRESS_BAR === '1')
        return stderr;
    
    return new Writable();
};

export const _getStream = getStream;

function _createProgress({total, color, test}) {
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
}

function formatOk() {
    const {TERMINAL_EMULATOR} = process.env;
    const spaces = /JetBrains/.test(TERMINAL_EMULATOR) ? ' ' : '';
    
    return `# ✅ ${spaces}ok`;
}

const formatSkip = (skipped) => `# ${WARNING} skip ${skipped}`;
