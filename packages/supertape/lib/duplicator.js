'use strict';

const once = require('once');
const StackTracey = require('stacktracey');

const getMessage = ({message, duplicatesMessage}) => [message, duplicatesMessage];
const getMessagesList = (tests) => tests.map(getMessage);
const compareMessage = (a) => ([b]) => a === b;
const getDuplicatesMessage = ([, a]) => a;

const processedList = new Set();

module.exports = ({tests}) => (msg) => {
    const getMessages = once(getMessagesList);
    const duplicates = getMessages(tests).filter(compareMessage(msg));
    
    if (duplicates.length < 2)
        return [];
    
    const [duplicatesMessage, duplicateAt] = duplicates.map(getDuplicatesMessage);
    
    if (processedList.has(duplicatesMessage))
        return [];
    
    processedList.add(duplicatesMessage);
    return [`Duplicate ${duplicatesMessage}`, duplicateAt];
};

module.exports.getDuplicatesMessage = ({checkDuplicates}) => {
    if (!checkDuplicates)
        return '';
    
    return getFileName();
};

const CALLS_FROM_TEST = 3;

function getFileName() {
    const {items} = new StackTracey(Error());
    
    for (const {beforeParse, file} of items.slice(CALLS_FROM_TEST)) {
        if (file.includes('node_modules'))
            continue;
        
        return beforeParse;
    }
    
    return '';
}
