import test, {
    test as superTest,
    Test,
} from '..';

// THROWS Expected 2 arguments, but got 0
test();

test('hello', (t: Test) => {
    // THROWS Property 'abc' does not exist on type 'Test'
    t.abc();
});

superTest('hello', (t: Test) => {
    t.equal(1, 2);
    t.end();
});
