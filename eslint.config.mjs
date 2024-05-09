import {safeAlign} from 'eslint-plugin-putout/config';
import {
    createESLintConfig,
    mergeESLintConfigs,
} from '@putout/eslint-flat';

const config = await mergeESLintConfigs(import.meta.url, 'packages');

export default createESLintConfig([safeAlign, config]);
