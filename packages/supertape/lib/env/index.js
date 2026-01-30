import process from 'node:process';

const {entries} = Object;
const addLoader = (a) => {
    return `"${a} --import supertape/css"`;
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
        
        const name = `SUPERTAPE_${key.toUpperCase()}`;
        
        result[name] = value;
    }
    
    return result;
};
