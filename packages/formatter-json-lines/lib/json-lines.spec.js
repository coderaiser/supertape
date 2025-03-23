import montag from 'montag';
import pullout from 'pullout';
import {test, createTest} from 'supertape';

const {parse} = JSON;

const pull = async (stream, i = 9) => {
    const output = await pullout(await stream);
    
    return output
        .split('\n')
        .slice(0, i)
        .join('\n');
};

test('supertape: format: json-lines', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'json-lines: success';
    
    const tapFn = (t) => {
        t.ok(false);
        t.end();
    };
    
    const tapMessage = 'json-lines: tap';
    
    const {
        test,
        run,
        stream,
    } = await createTest({
        format: 'json-lines',
    });
    
    test(successMessage, successFn);
    test(tapMessage, tapFn);
    
    const [result] = await Promise.all([
        pull(stream, 2),
        run(),
    ]);
    
    const expected = montag`
      {"count":1,"total":2,"failed":0,"test":"json-lines: success"}
      {"count":2,"total":2,"failed":1,"test":"json-lines: tap"}
    `;
    
    t.equal(result, expected);
    t.end();
});

test('supertape: format: json-lines: skip', async (t) => {
    const fn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const message = 'success';
    
    const {
        test,
        run,
        stream,
    } = await createTest({
        format: 'json-lines',
    });
    
    test(message, fn, {
        skip: true,
    });
    
    const [result] = await Promise.all([
        pull(stream, 8),
        run(),
    ]);
    
    const parsed = parse(result);
    
    const expected = {
        count: 0,
        passed: 0,
        failed: 0,
        skipped: 1,
    };
    
    t.deepEqual(parsed, expected);
    t.end();
});

test('supertape: format: json-lines: comment', async (t) => {
    const successFn = (t) => {
        t.ok(true);
        t.end();
    };
    
    const successMessage = 'json-lines: success';
    
    const tapFn = (t) => {
        t.comment('hello');
        t.ok(false);
        t.end();
    };
    
    const tapMessage = 'json-lines: tap';
    
    const {
        test,
        run,
        stream,
    } = await createTest({
        format: 'json-lines',
    });
    
    test(successMessage, successFn);
    test(tapMessage, tapFn);
    
    const [result] = await Promise.all([
        pull(stream, 12),
        run(),
    ]);
    
    const parsed = result
        .split('\n')
        .filter(Boolean)
        .map(parse);
    
    const FAIL = 2;
    
    delete parsed[FAIL].at;
    delete parsed[FAIL].errorStack;
    
    const expected = [{
        count: 1,
        failed: 0,
        test: 'json-lines: success',
        total: 2,
    }, {
        count: 2,
        failed: 1,
        test: 'json-lines: tap',
        total: 2,
    }, {
        result: false,
        count: 2,
        expected: true,
        message: 'should be truthy',
        operator: 'ok',
        test: 'json-lines: tap',
    }, {
        count: 2,
        failed: 1,
        passed: 1,
        skipped: 0,
    }];
    
    t.deepEqual(parsed, expected);
    t.end();
});
