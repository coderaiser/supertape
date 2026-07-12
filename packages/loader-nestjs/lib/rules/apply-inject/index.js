import {template, types} from 'putout';

const {decorator, stringLiteral} = types;
const createCall = template('Inject(%%SERVICE%%)');

export const report = () => `Apply @Inject`;

export const fix = (path) => {
    const nodeCall = createCall({
        SERVICE: stringLiteral('GithubService'),
    });
    
    const node = decorator(nodeCall);
    
    path.node.decorators = [node];
};
export const traverse = ({push}) => ({
    TSParameterProperty(path) {
        if (path.node.decorators)
            return;
        
        push(path);
    },
});
