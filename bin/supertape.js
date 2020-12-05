#!/usr/bin/env node

const cli = require('../lib/cli.js');

module.exports = cli({
    cwd: process.cwd(),
    argv: process.argv.slice(2),
});

