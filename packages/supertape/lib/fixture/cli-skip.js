const test = require('../supertape');

test.skip('hello world', (t) => {
    t.equal(1, 1);
    t.end();
});

