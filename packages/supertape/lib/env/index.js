import process from 'node:process';
import justSnakeCase from 'just-snake-case';

const isBool = (a) => typeof a === 'boolean';
const {entries} = Object;

const addLoader = (a) => `--import @supertape/loader-${a}`;

const parseValue = (a) => {
    if (isBool(a))
        return a ? 1 : 0;
    
    return a;
};

export const defineEnv = (config, overrides = {}) => {
    const {env = process.env} = overrides;
    const {NODE_OPTIONS = ''} = env;
    const result = {};
    let localEnv = NODE_OPTIONS;
    
    for (const [key, value] of entries(config)) {
        if (key === 'css' && value) {
            localEnv += ` ${addLoader('css')}`;
            continue;
        }
        
        if (key === 'jsx' && value) {
            localEnv += ` ${addLoader('jsx')}`;
            
            continue;
        }
        
        if (key === 'dom' && value) {
            localEnv += ` ${addLoader('dom')}`;
            
            continue;
        }
        
        if (key === 'ts' && value) {
            localEnv += ` ${addLoader('ts')}`;
            
            continue;
        }
        
        const name = `SUPERTAPE_${justSnakeCase(key).toUpperCase()}`;
        
        result[name] = parseValue(value);
    }
    
    result.NODE_OPTIONS = `"${localEnv}"`;
    
    return result;
};
