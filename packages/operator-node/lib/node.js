import test from 'supertape';

const noop = () => {};

const {assign} = Object;

let testRunner;

try {
    testRunner = await import('node:test');
} catch {}

export default createTest;

function createTest(operator) {
    const {report} = operator;
    
    if (testRunner)
        return (name, options, message) => {
            testRunner(name, options, message);
            return operator.pass();
        };
    
    assign(test, {
        skip: noop,
        todo: noop,
        runOnly: noop,
        diagnostic: report,
    });
    
    return test;
}

