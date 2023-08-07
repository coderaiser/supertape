'use strict';

const once = require('once');
const StackTracey = require('stacktracey');
const getDuplicatesMessage = ([, a]) => a;

const getMessage = ({message, at, validations}) => [
    message,
    at,
    validations,
];

const getMessagesList = (tests) => tests.map(getMessage);
const compareMessage = (a) => ([b]) => a === b;
const SCOPE_DEFINED = /^.*[\w-/\d\s]+:.*/;
const processedList = new Set();

const validations = {
    checkDuplicates: true,
    checkScopes: false,
    checkAssertionsCount: true,
};

const validators = {
    checkDuplicates,
    checkScopes,
    checkAssertionsCount,
};

const {
    assign,
    values,
    entries,
} = Object;

const findByMessage = (msg, tests) => {
    const getMessages = once(getMessagesList);
    
    return getMessages(tests).filter(compareMessage(msg));
};

module.exports.setValidations = ({checkDuplicates, checkScopes, checkAssertionsCount}) => {
    assign(validations, {
        checkDuplicates,
        checkScopes,
        checkAssertionsCount,
    });
};

const isValidationEnabled = (a) => values(a).filter(Boolean).length;

module.exports.createValidator = ({tests}) => (msg, options) => {
    if (!isValidationEnabled(validations))
        return [];
    
    for (const [name, enabled] of entries(validations)) {
        if (!enabled)
            continue;
        
        const filtered = findByMessage(msg, tests);
        
        if (!filtered.length)
            throw Error('☝️Looks like message cannot be find in tests, this should never happen');
        
        const [message, at] = validators[name](msg, filtered, options);
        
        if (at)
            return [message, at];
    }
    
    return [];
};

module.exports.getAt = () => getFileName();

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

function checkAssertionsCount(msg, filtered, options) {
    const {assertionsCount} = options;
    const [, at] = filtered[0];
    
    if (!isEnabled(filtered, 'checkAssertionsCount'))
        return [];
    
    if (assertionsCount > 1)
        return [
            `Only one assertion per test allowed, looks like you have more`,
            at,
        ];
    
    if (!assertionsCount)
        return [
            `Only one assertion per test allowed, looks like you have none`,
            at,
        ];
    
    return [];
}

function checkScopes(msg, filtered) {
    const [message, at] = filtered[0];
    
    if (!SCOPE_DEFINED.test(message))
        return [
            `Scope should be defined before first colon: 'scope: subject', received: '${message}'`,
            at,
        ];
    
    return [];
}

const isEnabled = (tests, name) => {
    for (const [, , validations] of tests) {
        if (!validations[name]) {
            return false;
        }
    }
    
    return true;
};

function checkDuplicates(msg, filtered) {
    if (filtered.length < 2)
        return [];
    
    if (!isEnabled(filtered, 'checkDuplicates'))
        return [];
    
    const [first, second] = filtered.map(getDuplicatesMessage);
    
    if (processedList.has(first))
        return [];
    
    processedList.add(first);
    return [
        `Duplicate ${first}`,
        second,
    ];
}
