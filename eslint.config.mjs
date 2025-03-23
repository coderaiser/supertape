import {safeAlign} from 'eslint-plugin-putout';
import {mergeESLintConfigs} from '@putout/eslint-flat';
import {defineConfig} from 'eslint/config';

const config = await mergeESLintConfigs(import.meta.url, 'packages');

export default defineConfig([safeAlign, config]);
