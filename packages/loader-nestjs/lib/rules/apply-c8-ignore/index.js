export const report = ({count}) => String(count);
export const fix = ({path, count}) => {
    path.node.leadingComments = [{
        type: 'CommentBlock',
        value: ` c8 ignore next ${count}`,
    }];
};
export const traverse = ({push}) => ({
    ClassMethod(path) {
        if (path.node.key.name !== 'constructor')
            return;
        
        const {start, end} = path.node.loc;
        
        if (path.node.leadingComments)
            return;
        
        const count = end.line - start.line;
        
        push({
            path,
            count,
        });
    },
});
