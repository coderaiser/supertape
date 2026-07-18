import {Buffer} from 'node:buffer';
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
            source: jsxToJs(url, String(source)),
            shortCircuit: true,
        };
    }
    
    return nextLoad(url, context);
}

export function jsxToJs(url, source) {
    const {
        errors,
        code,
        map,
    } = transformSync(url, source, {
        sourcemap: true,
        lang: 'jsx',
    });
    
    if (errors.length)
        throw Error(errors[0].message);
    
    const mapBase64 = Buffer
        .from(JSON.stringify(map))
        .toString('base64');
    
    return `${code}\n//# sourceMappingURL=data:application/json;base64,${mapBase64}`;
}
