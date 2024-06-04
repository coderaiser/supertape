import process from 'node:process';
import {createCommunication} from './communication.mjs';
import {subscribe} from './subscribe.mjs';
import {createIsStop} from './is-stop.mjs';
import {createFormatter} from './formatter.mjs';
import {parseArgs} from '../lib/cli/parse-args.js';
import cli from '../lib/cli.js';
import {
    overrideConsoleError,
    overrideConsoleLog,
} from '../lib/worker/create-console-log.js';

const {
    worker,
    parentPort,
    workerData,
    isMaster,
} = createCommunication(process.argv);

const args = parseArgs(process.argv.slice(2));

const {
    stdout,
    stderr,
    exit,
} = process;

const workerFormatter = createFormatter(parentPort);
const isStop = createIsStop(parentPort);

if (isMaster()) {
    subscribe({
        name: args.format,
        exit,
        worker,
        stdout,
    });
} else {
    overrideConsoleLog(parentPort, {
        console,
    });
    
    overrideConsoleError(parentPort, {
        console,
    });
}

export default await cli({
    stdout,
    stderr,
    exit,
    cwd: process.cwd(),
    argv: workerData.slice(2),
    workerFormatter,
    isStop,
});
