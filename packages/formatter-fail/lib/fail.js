import * as tap from '@supertape/formatter-tap';

export {
    start,
    comment,
    end,
} from '@supertape/formatter-tap';

import {fullstore} from 'fullstore';

const testStore = fullstore();

export const test = ({test}) => {
    testStore(test);
    return '';
};

export const fail = (...a) => {
    const message = testStore();
    const fail = tap.fail(...a);
    
    return `# ${message}\n${fail}`;
};
