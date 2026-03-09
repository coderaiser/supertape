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

export interface TestFunction {
    (message: string, fn: (t: Test) => void, options?: TestOptions): void;
    skip: TestFunction;
    only: TestFunction;
}
export let test: TestFunction;

export default test;

export type OperatorFactory<T extends OperatorFn = OperatorFn> = (operator: Operator) => T;

export type CustomOperator = Record<string, OperatorFactory>;

export declare function extend(operators: CustomOperator): TestFunction;

export let isOnlyTests: () => boolean;
