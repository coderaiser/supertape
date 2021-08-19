import {stub} from '..';

// THROWS Type 'Function' is not assignable to type 'string'.
const a: string = stub();

const fn = stub();
fn(a);
