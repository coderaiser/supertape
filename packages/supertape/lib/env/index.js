import process from 'node:process';
import justSnakeCase from 'just-snake-case';

const isBool = (a) => typeof a === 'boolean';
const {entries} = Object;

const addCSSLoader = (a) => `"${a} --import supertape/css"`;
const addJSXLoader = (a) => `"${a} --import supertape/jsx"`;

const parseValue = (a) => {
    if (isBool(a))
        return a ? 1 : 0;
    
    return a;
};

export const defineEnv = (config, overrides = {}) => {
    const {env = process.env} = overrides;
    const {NODE_OPTIONS = ''} = env;
    const result = {};
    
    for (const [key, value] of entries(config)) {
        if (key === 'css' && value) {
            result.NODE_OPTIONS = addCSSLoader(NODE_OPTIONS);
            continue;
        }
        
        if (key === 'jsx' && value) {
            result.NODE_OPTIONS = addJSXLoader(NODE_OPTIONS);
            continue;
        }
        
        const name = `SUPERTAPE_${justSnakeCase(key).toUpperCase()}`;
        
        result[name] = parseValue(value);
    }
    
    return result;
};
