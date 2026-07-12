import {registerHooks} from 'node:module';
import 'reflect-metadata';
import * as tsLoaderUrl from './nestjs.js';

registerHooks(tsLoaderUrl);
