'use strict';

const once = require('once');
const StackTracey = require('stacktracey');

const getMessage = ({message, duplicatesMessage}) => [message, duplicatesMessage];
const getMessagesList = (tests) => tests.map(getMessage);
const compareMessage = (a) => ([b]) => a === b;
const processedList = new Set();

module.exports = ({tests}) => (msg) => {
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

const messages = new Set();
const CALLS_FROM_TEST = 2;

module.exports.getDuplicatesMessage = ({message, checkDuplicates}) => {
    if (!checkDuplicates)
        return '';
    
    if (!messages.has(message)) {
        messages.add(message);
        return '';
    }
    
    const {items} = new StackTracey(Error());
    
    for (const {beforeParse, file} of items.slice(CALLS_FROM_TEST)) {
        if (file.includes('node_modules'))
            continue;
        
        return beforeParse;
    }
    
    return '';
};

