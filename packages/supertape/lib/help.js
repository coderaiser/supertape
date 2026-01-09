import bin from '../help.json' with {
    type: 'json',
};

export const help = () => {
    const usage = 'Usage: supertape [options] [path]';
    const result = [usage, 'Options'];
    
    for (const name of Object.keys(bin)) {
        result.push(`   ${name} ${bin[name]}`);
    }
    
    return result.join('\n') + '\n';
};
