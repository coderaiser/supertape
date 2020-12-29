#!/usr/bin/env node

'use strict';

const cli = require('../lib/cli.js');

const {
    stdout,
    stderr,
    exit,
} = process;

module.exports = cli({
    stdout,
    stderr,
    exit,
    cwd: process.cwd(),
    argv: process.argv.slice(2),
});

