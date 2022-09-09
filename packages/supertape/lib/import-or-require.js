'use strict';

const {resolve: resolvePath, extname: extnamePath} = require('path');
const {pathToFileURL} = require('url');

module.exports.importOrRequire = (cwd, file) => {
    const resolved = resolvePath(cwd, file);
    
    if (extnamePath(file).includes('js')) {
        // always resolve before import for windows
        import(pathToFileURL(resolved));
    } else {
        require(resolved);
    }
};

