import once from 'once';

export const enableOnce = () => {
    globalThis.onceDisabled = false;
};

export const disableOnce = () => {
    globalThis.onceDisabled = true;
};

export const maybeOnce = (fn) => {
    const onced = once(fn);
    
    return (...a) => {
        if (globalThis.onceDisabled)
            return fn(...a);
        
        return onced(...a);
    };
};
