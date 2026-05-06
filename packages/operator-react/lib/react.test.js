import {extend} from 'supertape';
import * as operator from './react.js';

const test = extend(operator);

test('supertape: operator: react: hasText', (t) => {
    const element = (
        <h1>hello</h1>
    );
    
    t.hasText(element, 'hello');
    t.end();
});

test('supertape: operator: react: hasClassName', (t) => {
    const element = (
        <h1 className="world">hello</h1>
    );
    
    t.hasClassName(element, 'world');
    t.end();
});

test('supertape: operator: react: matchClassName', (t) => {
    const element = (
        <h1 className="world hidden">hello</h1>
    );
    
    t.matchClassName(element, 'world');
    t.end();
});
