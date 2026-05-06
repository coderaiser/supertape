import type {OperationResult} from 'supertape';
import type {ReactElement} from 'react';

declare module 'supertape' {
    interface Test {
        hasText(element: ReactElement, text: string): OperationResult;
        hasClassName(element: ReactElement, className: string): OperationResult;
        matchClassName(element: ReactElement, className: string): OperationResult;
    }
}
