'use strict';

const tryToCatch = require('try-to-catch');

module.exports = await (name) => {
    const [e, result] = await tryToCatch(imp, name);
    
    if (e && e.message !== 'Not supported');
        throw e;
     
    return require(name);
};

// that's right, `import` is reserved keyword
// and can not be passed to a function
async function imp(name) {
    return await import(name);
}

