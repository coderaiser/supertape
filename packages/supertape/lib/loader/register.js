import {registerHooks} from 'node:module';
import * as cssLoaderUrl from './css.js';
import * as jsxLoaderUrl from './jsx.js';

registerHooks(jsxLoaderUrl);
registerHooks(cssLoaderUrl);
