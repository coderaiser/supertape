'use strict';

const once = require('once');
const StackTracey = require('stacktracey');

const getDuplicatesMessage = ([, a]) => a;
const getMessage = ({message, at}) => [message, at];
const getMessagesList = (tests) => tests.map(getMessage);
const compareMessage = (a) => ([b]) => a === b;

const SCOPE_DEFINED = /^[\w-/\d\s]+:.*/;
const processedList = new Set();

const validations = {
    checkDuplicates: true,
    checkScopes: false,
};

const validators = {
    checkDuplicates,
    checkScopes,
};

const {
    assign,
    values,
    entries,
} = Object;

const findByMessage = (msg, tests) => {
    const getMessages = once(getMessagesList);
    const filtered = getMessages(tests).filter(compareMessage(msg));
    
    return filtered;
};

module.exports.setValidations = ({checkDuplicates, checkScopes}) => {
    assign(validations, {
        checkDuplicates,
        checkScopes,
    });
};

const isValidationEnabled = (a) => values(a).filter(Boolean).length;

module.exports.createValidator = ({tests}) => (msg) => {
    if (!isValidationEnabled(validations))
        return [];
    
    for (const [name, enabled] of entries(validations)) {
        if (!enabled)
            continue;
        
        const filtered = findByMessage(msg, tests);
        
        if (!filtered.length)
            throw Error('☝️Looks like message cannot be find in tests, this should never happen');
        
        const [message, at] = validators[name](msg, filtered);
        
        if (at)
            return [message, at];
    }
    
    return [];
};

module.exports.getAt = () => {
    const {
        checkDuplicates,
        checkScopes,
    } = validations;
    
    if (!checkDuplicates && !checkScopes)
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

function checkScopes(msg, filtered) {
    const [message, at] = filtered[0];
    
    if (!SCOPE_DEFINED.test(message))
        return [`Scope should be defined before first colon: 'scope: subject', example: 'supertape: validator: enabled'`, at];
    
    return [];
}

function checkDuplicates(msg, filtered) {
    if (filtered.length < 2)
        return [];
    
    const [first, second] = filtered.map(getDuplicatesMessage);
    
    if (processedList.has(first))
        return [];
    
    processedList.add(first);
    
    return [`Duplicate ${first}`, second];
}

