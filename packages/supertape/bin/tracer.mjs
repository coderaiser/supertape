#!/usr/bin/env node

import process from 'node:process';
import {Worker} from 'node:worker_threads';
import {parseArgs} from '../lib/cli/parse-args.js';
import {subscribe} from './subscribe.mjs';

const {
    cwd,
    exit,
    stdout,
} = process;

const args = parseArgs(process.argv.slice(2));
const write = stdout.write.bind(stdout);

if (!args.worker) {
    await import('./supertape.mjs');
    exit();
}

const slave = new URL('./supertape.mjs', import.meta.url);

const worker = new Worker(slave, {
    workerData: process.argv,
    stdin: true,
});

await subscribe({
    name: args.format,
    args,
    worker,
    exit,
    cwd,
    write,
    stdout,
});
