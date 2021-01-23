import {getPaths} from './get-paths.js';
import {createSimport} from 'simport';

const {assign} = Object;
const simport = createSimport(import.meta.url);

export const loadOperators = async (operators) => {
    const promises = [];
    const paths = getPaths(operators);
    
    for (const path of paths) {
        promises.push(simport(path));
    }
    
    const loadedOperators = await Promise.all(promises);
    
    return assign(...loadedOperators);
};

