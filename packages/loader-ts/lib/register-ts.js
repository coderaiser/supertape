import {registerHooks} from 'node:module';
import 'reflect-metadata';
import * as tsLoaderUrl from './ts.js';

registerHooks(tsLoaderUrl);
