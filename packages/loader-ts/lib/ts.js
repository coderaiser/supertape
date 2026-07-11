import ts from 'typescript';

export function resolve(specifier, context, nextResolve) {
    if (/\.tsx?$/.test(specifier))
        return {
            url: new URL(specifier, context.parentURL).href,
            shortCircuit: true,
        };
    
    return nextResolve(specifier, context);
}

export function load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url)) {
        const {source} = nextLoad(url, {
            format: 'module',
        });
        
        return {
            format: 'module',
            source: tsToJs(url, String(source)),
            shortCircuit: true,
        };
    }
    
    return nextLoad(url, context);
}

export function tsToJs(fileName, source) {
    const {outputText} = ts.transpileModule(source, {
        fileName,
        compilerOptions: {
            module: ts.ModuleKind.ESM,
            target: ts.ScriptTarget.ES2026,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            sourceMap: true,
            inlineSources: true,
            inlineSourceMap: true,
        },
    });
    
    return outputText;
}
