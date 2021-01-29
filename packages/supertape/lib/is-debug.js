'use strict';

const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');

module.exports = isDebug;

