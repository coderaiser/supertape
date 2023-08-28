import {createRequire} from 'node:module';
import tryCatch from 'try-catch';

const {resolve} = createRequire(import.meta.url);

const bigFirst = (a) => `${a[0].toUpperCase()}${a.slice(1)}`;

const namespace = 'supertape';
const type = 'operator';

export const getPaths = (operators) => {
    const names = [];
    
    for (const name of operators) {
        const fullPath = getPath(namespace, type, name);
        
        if (!fullPath)
            throw Error(`${bigFirst(type)} "${namespace}-${type}-${name}" could not be found!`);
        
        names.push(fullPath);
    }
    
    return names;
};

function getPath(namespace, type, name) {
    let path = getModulePath(`@${namespace}/${type}-${name}`);
    
    if (!path)
        path = getModulePath(`${namespace}-${type}-${name}`);
    
    return path;
}

function getModulePath(name) {
    const [, path] = tryCatch(resolve, name);
    return path;
}
