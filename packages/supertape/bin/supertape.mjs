import process from 'node:process';
import {createCommunication} from './communication.mjs';
import {subscribe} from './subscribe.mjs';
import {createIsStop} from './is-stop.mjs';
import {createFormatter} from './formatter.mjs';
import {parseArgs} from '../lib/cli/parse-args.js';
import cli from '../lib/cli.js';

const {
    worker,
    parentPort,
    workerData,
} = createCommunication(process.argv);

const args = parseArgs(process.argv.slice(2));

const {
    stdout,
    stderr,
    exit,
} = process;

const workerFormatter = createFormatter(parentPort);
const isStop = createIsStop(parentPort);

if (worker)
    subscribe({
        name: args.format,
        exit,
        worker,
        stdout,
    });

export default await cli({
    stdout,
    stderr,
    exit,
    cwd: process.cwd(),
    argv: workerData.slice(2),
    workerFormatter,
    isStop,
});
