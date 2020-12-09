#!/usr/bin/env node

'use strict';

const cli = require('../lib/cli.js');

const {stdout, exit} = process;

module.exports = cli({
    stdout,
    exit,
    cwd: process.cwd(),
    argv: process.argv.slice(2),
});

