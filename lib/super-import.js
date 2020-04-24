'use strict';

const tryToCatch = require('try-to-catch');

module.exports = async (name) => {
    const [e, result] = await tryToCatch(imp, name);
    
    if (!e)
        return result;
    
    if (e.message === 'Not supported')
        return require(name);
    
    throw e;
};

// that's right, `import` is reserved keyword
// and can not be passed to a function
async function imp(name) {
    return await import(name);
}

