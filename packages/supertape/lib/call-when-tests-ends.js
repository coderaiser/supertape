import _process from 'node:process';
import {isOnlyTests as _isOnlyTests} from './is-only-tests.js';
import {isSkipTests as _isSkipTests} from './is-skip-tests.js';

export function callWhenTestsEnds(name, fn, overrides = {}) {
    const {
        process = _process,
        isOnlyTests = _isOnlyTests,
        isSkipTests = _isSkipTests,
    } = overrides;
    
    if (!process.env[name])
        return;
    
    const runner = () => {
        if (isOnlyTests() || isSkipTests())
            return;
        
        process.exitCode = fn() || 0;
    };
    
    process.once('exit', runner);
}
