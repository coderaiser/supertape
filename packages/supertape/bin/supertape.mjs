#!/usr/bin/env node

import cli from '../lib/cli.js';

const {
    stdout,
    stderr,
    exit,
} = process;

export default cli({
    stdout,
    stderr,
    exit,
    cwd: process.cwd(),
    argv: process.argv.slice(2),
});

