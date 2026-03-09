import type {OperationResult} from 'supertape';
declare module 'supertape' {
    interface Test {
        stripEqual(
            result: string,
            expected: string,
            message?: string
        ): OperationResult;
        
        stripEndEqual(
            result: string,
            expected: string,
            message?: string
        ): OperationResult;
    }

}
