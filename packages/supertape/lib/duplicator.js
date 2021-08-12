'use strict';

const once = require('once');

const getMessage = ({message, fileName}) => [message, fileName];
const getMessagesList = (tests) => tests.map(getMessage);
const compareMessage = (a) => ([b]) => a === b;

module.exports = (tests) => (msg) => {
    const getMessages = once(getMessagesList);
    const duplicates = getMessages(tests).filter(compareMessage(msg));
    
    if (duplicates.length < 2)
        return '';
    
    const [, fileName] = duplicates.pop();
    return fileName;
};

