type Result = {
    is: boolean,
}

export interface Test {
    equal: (from: unknown, to: unknown, message?: string) => Result;
    notEqual: (from: unknown, to: unknown, message?: string) => Result;
    deepEqual: (from: unknown, to: unknown, message?: string) => Result;
    notDeepEqual: (from: unknown, to: unknown, message?: string) => Result;
    fail: (message: string) => Result;
    pass: (message: string) => Result;
    ok: (result: boolean | unknown, message?: string) => Result;
    commoent: (message: string);
    notOk: (result: boolean | unknown, message?: string) => Result;
    match: (result: string, pattern: string | regexp, message?: string) => Result;
    notMatch: (result: string, pattern: string | regexp, message?: string) => Result;
    end: () => void;
}

export function test(message: string, fn: (t: Test) => void): void;
