import process from 'node:process';

const argv = process.execArgv.join();

export default () => argv.includes('inspect') || argv.includes('debug');
