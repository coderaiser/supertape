import process from 'node:process';
import justSnakeCase from 'just-snake-case';

const isBool = (a) => typeof a === 'boolean';
const {entries} = Object;

const addLoader = (a) => {
    return `"${a} --import supertape/css"`;
};

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
            result.NODE_OPTIONS = addLoader(NODE_OPTIONS);
            continue;
        }
        
        const name = `SUPERTAPE_${justSnakeCase(key).toUpperCase()}`;
        
        result[name] = parseValue(value);
    }
    
    return result;
};
