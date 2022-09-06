import * as tap from '@supertape/formatter-tap';
import fullstore from 'fullstore';

const {
    start,
    comment,
    end,
} = tap;
const testStore = fullstore();

function test({test}) {
    testStore(test);
    return '';
}

function fail(...a) {
    const message = testStore();
    const fail = tap.fail(...a);
    
    return `# ${message}\n${fail}`;
}

export default {
    start,
    test,
    comment,
    fail,
    end,
};

