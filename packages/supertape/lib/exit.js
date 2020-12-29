'use strict';

const OK = 0;
const FAIL = 1;
const WAS_STOP = 2;
const REJECT = 3;

module.exports.getExitCode = ({failed, isStop, error}) => {
    if (isStop())
        return WAS_STOP;
    
    if (failed)
        return FAIL;
    
    if (error)
        return REJECT;
    
    return OK;
};

module.exports.exitCodes = {
    OK,
    FAIL,
    WAS_STOP,
    REJECT,
};
