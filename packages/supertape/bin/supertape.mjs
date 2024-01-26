import process from 'node:process';
import cli from '../lib/cli.js';
import {createCommunication} from './communication.mjs';
import {subscribe} from './subscribe.mjs';
import {createFormatter} from './formatter.mjs';
import {parseArgs} from '../lib/cli/parse-args.js';

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

if (worker)
    subscribe({
        name: args.format,
        quiet: args.quiet,
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
});
