import {cloneElement} from 'react';
import {
    render,
    screen,
    cleanup,
} from '@testing-library/react';

const TEST_ID = '__supertape_operator_react';

export const hasText = (operator) => (element, text) => {
    cleanup();
    render(element);
    
    const result = screen.getByText(text);
    
    return operator.ok(result);
};

export const hasClassName = (operator) => (element, className) => {
    cleanup();
    
    const updatedElement = cloneElement(element, {
        'data-testid': TEST_ID,
    });
    
    const {getByTestId} = render(updatedElement);
    
    const result = getByTestId(TEST_ID);
    
    return operator.equal(result.className, className);
};

export const matchClassName = (operator) => (element, className) => {
    cleanup();
    
    const updatedElement = cloneElement(element, {
        'data-testid': TEST_ID,
    });
    
    const {getByTestId} = render(updatedElement);
    const result = getByTestId(TEST_ID);
    
    return operator.match(result.className, className);
};
