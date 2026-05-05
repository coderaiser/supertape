import {transformSync} from 'oxc-transform';

export function resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.jsx'))
        return {
            url: new URL(specifier, context.parentURL).href,
            shortCircuit: true,
        };
    
    return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
    if (url.endsWith('.jsx') || url.endsWith('.js')) {
        if (url.includes('node_modules'))
            return nextLoad(url, context);
        
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
    const {code} = transformSync('__supertape.js', source, {
        jsx: {
            runtime: 'automatic',
        },
    });
    
    return code;
}
