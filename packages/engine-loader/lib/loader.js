import {getPaths} from './get-paths.js';
import {simpleImport} from './simple-import.js';

const {assign} = Object;

export const loadOperators = async (operators) => {
    const promises = [];
    const paths = getPaths(operators);
    
    for (const path of paths)
        promises.push(simpleImport(path));
    
    const loadedOperators = await Promise.all(promises);
    
    return assign(...loadedOperators);
};

