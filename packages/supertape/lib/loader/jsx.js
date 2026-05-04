import {transformSync} from '@swc/core';

export function resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.jsx'))
        return {
            url: new URL(specifier, context.parentURL).href,
            shortCircuit: true,
        };
    
    return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
    if (url.endsWith('.jsx')) {
        const {source} = nextLoad(url, {
            format: 'module',
        });
        
        return {
            format: 'module',
            source: jsxToJs(String(source)),
            shortCircuit: true,
        };
    }
    
    return nextLoad(url, context);
}

export function jsxToJs(source) {
    const {code} = transformSync(source, {
        jsc: {
            parser: {
                syntax: 'ecmascript',
                jsx: true,
            },
            transform: {
                react: {
                    runtime: 'automatic',
                },
            },
        },
    });
    
    return code;
}
