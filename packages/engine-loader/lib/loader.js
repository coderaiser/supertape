import {pathToFileURL} from 'node:url';
import {getPaths} from './get-paths.js';
import {simpleImport} from './simple-import.js';

const {assign} = Object;

export const loadOperators = async (operators) => {
    const promises = [];
    const paths = getPaths(operators);
    
    for (const path of paths) {
        // always convert to fileURL for windows
        const resolved = pathToFileURL(path);
        promises.push(simpleImport(resolved));
    }
    
    const loadedOperators = await Promise.all(promises);
    
    return assign(...loadedOperators);
};
