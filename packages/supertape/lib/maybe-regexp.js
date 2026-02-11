const isStr = (a) => typeof a === 'string';
const encode = (a) => a
    .replaceAll('^', '\\^')
    .replaceAll(')', '\\)')
    .replaceAll('(', '\\(');

export const maybeRegExp = (a) => {
    if (!isStr(a))
        return a;
    
    return RegExp(encode(a));
};
