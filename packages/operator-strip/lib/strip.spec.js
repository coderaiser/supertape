import {styleText} from 'node:util';
import {extend} from 'supertape';
import montag from 'montag';
import * as operator from './strip.js';

const test = extend(operator);

test('supertape: operator: strip: stripEqual', (t) => {
    const result = `    # 🍄 ${styleText('red', 'hello')}`;
    
    const expected = montag`
        # 🍄 hello
    `;
    
    t.stripEqual(result, expected);
    t.end();
});

test('supertape: operator: strip: stripEndEqual', (t) => {
    const result = montag`
        # 🍄 hello  
    `;
    
    const expected = montag`
        # 🍄 hello
    `;
    
    t.stripEndEqual(result, expected);
    t.end();
});
