'use strict';

const process = require('node:process');
const argv = process.execArgv.join();

module.exports = argv.includes('inspect') || argv.includes('debug');
