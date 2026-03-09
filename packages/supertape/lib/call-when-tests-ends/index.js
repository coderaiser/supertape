import _process from 'node:process';
import {isOnlyTests as _isOnlyTests} from '#is-only-tests';
import {isSkipTests as _isSkipTests} from '#is-skip-tests';
import {isFailTests as _isFailTests} from '#is-fail-tests';

export function callWhenTestsEnds(name, fn, overrides = {}) {
    const {
        process = _process,
        isOnlyTests = _isOnlyTests,
        isSkipTests = _isSkipTests,
        isFailTests = _isFailTests,
    } = overrides;
    
    if (!process.env[name])
        return;
    
    const runner = () => {
        if (isOnlyTests())
            return;
        
        if (isSkipTests())
            return;
        
        if (isFailTests())
            return;
        
        const exitCode = fn();
        
        process.exitCode = exitCode || 0;
    };
    
    process.once('exit', runner);
}
