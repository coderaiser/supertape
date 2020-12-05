#!/usr/bin/env node

'use strict';

const cli = require('../lib/cli.js');

const {stdout} = process;
const write = stdout.write.bind(stdout);

module.exports = cli({
    write,
    cwd: process.cwd(),
    argv: process.argv.slice(2),
});

