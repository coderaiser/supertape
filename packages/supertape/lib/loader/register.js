import {register} from 'node:module';

const loaderUrl = new URL('./css.js', import.meta.url);

register(loaderUrl);
