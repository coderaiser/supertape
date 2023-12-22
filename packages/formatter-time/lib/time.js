import {Writable} from 'node:stream';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import fullstore from 'fullstore';
import {isCI} from 'ci-info';
import process from 'node:process';
import {Timer} from 'timer-node';

global._isCI = isCI;

const OK = '👌';
const YELLOW = '#218bff';

const {red} = chalk;
const formatErrorsCount = (a) => a ? red(a) : OK;

const isStr = (a) => typeof a === 'string';

const {stderr} = process;

let SUPERTAPE_TIME;
let SUPERTAPE_TIME_MIN = 100;
let SUPERTAPE_TIME_COLOR;
let SUPERTAPE_TIME_STACK = 1;
let SUPERTAPE_TIME_CLOCK = '⏳';

export function createFormatter(bar) {
    ({
        SUPERTAPE_TIME,
        SUPERTAPE_TIME_MIN = 100,
        SUPERTAPE_TIME_COLOR,
        SUPERTAPE_TIME_STACK = 1,
        SUPERTAPE_TIME_CLOCK = '⏳',
    } = process.env);
    
    const out = createOutput();
    const store = fullstore();
    const barStore = fullstore(bar);
    const timerStore = fullstore();
    
    return {
        start: start({
            barStore,
            timerStore,
            out,
        }),
        test: test({
            store,
        }),
        testEnd: testEnd({
            clock: SUPERTAPE_TIME_CLOCK,
            barStore,
            timerStore,
        }),
        fail: fail({
            out,
            store,
        }),
        end: end({
            barStore,
            out,
        }),
    };
}

export const start = ({barStore, timerStore, out}) => ({total}) => {
    out('TAP version 13');
    
    const color = SUPERTAPE_TIME_COLOR || YELLOW;
    const {bar, timer} = _createProgress({
        total,
        color,
        test: '',
    });
    
    barStore(bar);
    timerStore(timer);
};

export const test = ({store}) => ({test}) => {
    store(`# ${test}`);
};

export const testEnd = ({barStore, clock, timerStore}) => ({count, total, failed, test}) => {
    const timer = timerStore();
    
    barStore().increment({
        count,
        total,
        test,
        failed: formatErrorsCount(failed),
        time: !timer ? '' : getTime({
            clock,
            timer: timerStore(),
        }),
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
    
    if (SUPERTAPE_TIME_STACK !== '0') {
        out('    stack: |-');
        out(errorStack);
    }
    
    out('  ...');
    out('');
};

export const end = ({barStore, out}) => ({count, passed, failed, skiped}) => {
    barStore().stop();
    
    out('');
    
    out(`1..${count}`);
    out(`# tests ${count}`);
    out(`# pass ${passed}`);
    
    if (skiped)
        out(`# ⚠️  skip ${skiped}`);
    
    out('');
    
    if (failed)
        out(`# ❌ fail ${failed}`);
    
    if (!failed)
        out('# ✅ ok');
    
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
    const is = total >= SUPERTAPE_TIME_MIN;
    
    if (is && !global._isCI || SUPERTAPE_TIME === '1')
        return stderr;
    
    return new Writable();
};

export const _getStream = getStream;

function _createProgress({total, color, test}) {
    const timer = new Timer({
        label: 'supertape-timer',
    });
    
    const colorFn = getColorFn(color);
    const bar = new cliProgress.SingleBar({
        format: `${colorFn('{bar}')} {percentage}% | {failed} | {count}/{total} | {time} | {test}`,
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
        time: getTime({
            clock: SUPERTAPE_TIME_CLOCK,
            timer,
        }),
    });
    
    return {
        bar,
        timer,
    };
}

export const maybeZero = (a) => a <= 9 ? '0' : '';

function getTime({clock, timer}) {
    const {m, s} = timer.time();
    const minute = `${maybeZero(m)}${m}`;
    const second = `${maybeZero(s)}${s}`;
    
    return `${clock} ${minute}:${second}`;
}
