import {test} from 'supertape';
import {montag} from 'montag';
import {convert} from './nestjs.js';

test('supertape: loader: nestjs: convert', (t) => {
    const source = montag`
        class X {
            constructor(
                private readonly githubService: GithubService,
            ) {}
        }
    `;
    
    const result = convert('hello.ts', source);
    
    t.match(result, '/* c8 ignore');
    t.end();
});
