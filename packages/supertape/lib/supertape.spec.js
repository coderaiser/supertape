'use strict';

const {once} = require('events');
const {Transform} = require('stream');

const test = require('..');
const montag = require('montag');
const {reRequire} = require('mock-require');
const pullout = require('pullout');

const pull = async (stream) => {
    const output = await pullout(stream);
    return output.slice(0, -2);
};

test('supertape: equal', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello';
    
    const supertape = reRequire('..');
    
    supertape.init({
        run: false,
        quiet: true,
    });
    
    supertape(message, fn);
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: deepEqual', async (t) => {
    const fn = (t) => {
        const a = {
            hello: 'world',
        };
        const b = {
            hello: 'world',
        };
        
        t.deepEqual(a, b, 'hello message');
        t.end();
    };
    
    const message = 'hello';
    
    const supertape = reRequire('./supertape');
    
    supertape.init({
        run: false,
        quiet: true,
    });
    
    supertape(message, fn);
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 hello message
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: createStream', async (t) => {
    const fn = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    supertape.init({
        quiet: true,
    });
    
    const stream = supertape.createStream();
    
    supertape(message, fn);
    
    const [result] = await Promise.all([
        pull(stream),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should be falsy
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape.skip(message, fn, {
        quiet: true,
    });
    
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    
    t.end();
});

test('supertape: only', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message1 = 'world';
    const message2 = 'hello';
    
    reRequire('./run-tests');
    const supertape = reRequire('..');
    
    const emitter = supertape.only(message1, fn1, {
        quiet: true,
    });
    
    supertape(message2, fn2, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # world
        ok 1 should be truthy
        
        1..1
        # tests 1
        # pass 1
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape(message, fn, {
        quiet: true,
        extensions,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: only', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape.only(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should transform code
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: extensions: extend: skip', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape.skip(message, fn, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: quiet: false', async (t) => {
    const extensions = {
        transformCode: (t) => (a, b) => {
            return t.equal(a + 1, b, 'should transform code');
        },
    };
    
    const fn = (t) => {
        t.transformCode(0, 1);
        t.end();
    };
    
    const message = 'hello';
    const {stdout} = process;
    
    Object.defineProperty(process, 'stdout', {
        value: createStream(),
        writable: false,
    });
    
    const supertape = reRequire('..');
    const extendedTape = supertape.extend(extensions);
    
    const emitter = extendedTape.skip(message, fn, {
        quiet: false,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    Object.defineProperty(process, 'stdout', {
        value: stdout,
        writable: false,
    });
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: destructuring test', async (t) => {
    const fn = (t) => {
        t.equal(1, 1);
        t.end();
    };
    
    const message = 'hello';
    
    const supertape = reRequire('..');
    
    supertape.init({
        run: false,
        quiet: true,
    });
    
    supertape.test(message, fn);
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(supertape.run(), 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # hello
        ok 1 should equal
        
        1..1
        # tests 1
        # pass 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: destructuring test: only', async (t) => {
    const fn1 = (t) => {
        t.ok(true);
        t.end();
    };
    
    const fn2 = (t) => {
        t.notOk(false);
        t.end();
    };
    
    const message1 = 'world';
    const message2 = 'hello';
    
    reRequire('./run-tests');
    const supertape = reRequire('..');
    
    const emitter = supertape.test.only(message1, fn1, {
        quiet: true,
    });
    
    supertape.test(message2, fn2, {
        quiet: true,
    });
    
    const [result] = await Promise.all([
        pull(supertape.createStream()),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        # world
        ok 1 should be truthy
        
        1..1
        # tests 1
        # pass 1
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: destructuring test: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'hello';
    const supertape = reRequire('..');
    
    const emitter = supertape.test.skip(message, fn, {
        quiet: true,
    });
    
    const stream = supertape.createStream();
    
    const [result] = await Promise.all([
        pull(stream),
        once(emitter, 'end'),
    ]);
    
    const expected = montag`
        TAP version 13
        
        1..0
        # tests 0
        # pass 0
        # skip 1
        
        # ok
    `;
    
    t.equal(result, expected);
    
    t.end();
});

function createStream() {
    return new Transform({
        transform(chunk, encoding, callback) {
            this.push(chunk);
            callback();
        },
    });
}
