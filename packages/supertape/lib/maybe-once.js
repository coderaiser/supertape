'use strict';

const once = require('once');

module.exports.enableOnce = () => {
    globalThis.onceDisabled = false;
};

module.exports.disableOnce = () => {
    globalThis.onceDisabled = true;
};

module.exports.maybeOnce = (fn) => {
    const onced = once(fn);
    
    return (...a) => {
        if (globalThis.onceDisabled)
            return fn(...a);
        
        return onced(...a);
    };
};
