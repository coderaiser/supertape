import {defineEnv} from '../lib/env/index.js';

const testEnv = defineEnv({
    nestjs: true,
});

const {NODE_OPTIONS} = defineEnv({
    ts: true,
});

console.log(testEnv, NODE_OPTIONS);
