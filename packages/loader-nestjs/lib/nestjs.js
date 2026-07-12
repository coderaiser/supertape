import {tsToJs} from '@supertape/loader-ts/ts';
import {putout} from 'putout';
import * as applyC8Ignore from './rules/apply-c8-ignore/index.js';

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
            source: convert(url, String(source)),
            shortCircuit: true,
        };
    }
    
    return nextLoad(url, context);
}

export function convert(name, source) {
    const {places} = putout(source, {
        isTS: true,
        fix: false,
        plugins: [
            ['apply-c8-ignore', applyC8Ignore],
        ],
    });
    
    if (places.length) {
        const [first] = places;
        const count = first.message;
        
        source = source.replaceAll('constructor', `/* c8 ignore next ${count} */ constructor`);
    }
    
    return tsToJs(name, source);
}
