import {OperatorStub} from '@supertape/operator-stub';

export {Stub, stub} from '@cloudcmd/stub';

type OperationBaseResult = {
    is: boolean;
    expected: unknown;
    result: unknown;
    message: string;
    output: string;
};

export type OperationResult = OperationBaseResult | Promise<OperationBaseResult>;

export type OperatorFn = (...args: unknown[]) => OperationResult;

export interface Operator {}

export interface Test extends Operator, OperatorStub {
    equal(result: unknown, expected: unknown, message?: string): OperationResult;
    notEqual(result: unknown, expected: unknown, message?: string): OperationResult;
    deepEqual(result: unknown, expected: unknown, message?: string): OperationResult;
    notDeepEqual(result: unknown, expected: unknown, message?: string): OperationResult;
    fail(message: string): OperationResult;
    pass(message: string): OperationResult;
    ok(result: boolean | unknown, message?: string): OperationResult;
    comment(message: string): OperationResult;
    notOk(result: boolean | unknown, message?: string): OperationResult;
    match(result: string, pattern: string | RegExp, message?: string): OperationResult;
    notMatch(result: string, pattern: string | RegExp, message?: string): OperationResult;
    end(): void;
}

export type TestOptions = {
    checkAssertionsCount?: boolean;
    checkScopes?: boolean;
    checkDuplicates?: boolean;
    timeout?: number;
};

export type TestFunction<T extends Test = Test> = ((message: string, fn: (t: T) => void, options?: TestOptions) => void) & {
    skip: TestFunction<T>;
    only: TestFunction<T>;
};

export let test: TestFunction<Test>;

export default test;

export type OperatorFactory<T extends (...args: any[]) => OperationResult = (...args: any[]) => OperationResult> = (operator: Test) => T;

export type CustomOperator = Record<string, OperatorFactory>;

type OperatorsToMethods<T extends CustomOperator> = {
    [K in keyof T]:
    T[K] extends (...args: any[]) => infer R
        ? R
        : never;
};

export declare function extend<T extends CustomOperator>(operators: T): TestFunction<Test & OperatorsToMethods<T>>;

export let isOnlyTests: () => boolean;
export let isSkipTests: () => boolean;
export let isFailTests: () => boolean;

export let callWhenTestsEnds: (name: string, fn: () => number | void) => void;
