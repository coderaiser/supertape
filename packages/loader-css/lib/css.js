export function resolve(specifier, context, nextResolve) {
    if (specifier.endsWith('.css'))
        return {
            url: new URL(specifier, context.parentURL).href,
            shortCircuit: true,
        };
    
    return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
    if (url.endsWith('.css'))
        return {
            format: 'module',
            source: 'export default {};',
            shortCircuit: true,
        };
    
    return nextLoad(url, context);
}
