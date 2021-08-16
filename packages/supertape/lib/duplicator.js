'use strict';

const once = require('once');

const getMessage = ({message, duplicatesMessage}) => [message, duplicatesMessage];
const getMessagesList = (tests) => tests.map(getMessage);
const compareMessage = (a) => ([b]) => a === b;
const processedList = new Set();

module.exports = ({tests, checkDuplicates}) => (msg) => {
    if (!checkDuplicates)
        return '';
    
    const getMessages = once(getMessagesList);
    const duplicates = getMessages(tests).filter(compareMessage(msg));
    
    if (duplicates.length < 2)
        return '';
    
    const [, duplicatesMessage] = duplicates.pop();
    
    if (processedList.has(duplicatesMessage))
        return '';
    
    processedList.add(duplicatesMessage);
    return duplicatesMessage;
};

