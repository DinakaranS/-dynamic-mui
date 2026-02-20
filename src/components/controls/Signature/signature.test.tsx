import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Signature from './signature';
import { ControlProps } from '../../../types';

// Mock react-signature-canvas
vi.mock('react-signature-canvas', () => {
    return {
        default: vi.fn().mockImplementation((props) => {
            return (
                <div data-testid="mock-signature-canvas">
                    <button onClick={() => {
                        // Simulate ref methods if needed exposed via some mechanism?
                        // Or just mock the ref directly in the component test logic?
                        // Hard to mock ref methods from outside without forwardRef or similar.
                        // But we can check rendering.
                    }}>Mock Canvas</button>
                    <input data-testid="canvas-input" />
                </div>
            );
        })
    };
});

// We need to mock the ref usage in the component, or the component calls methods on the ref.
// Since we mocked the class default export, the component will get our mock.
// But the ref.current will be the instance of our mock class.
// So we need to ensure our mock class has `isEmpty`, `clear`, `getTrimmedCanvas` methods.

describe('Signature Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-signature',
            value: '',
            label: 'Sign Here'
        },
        onChange: mockOnChange,
        rules: {}
    };

    // Helper to setup mock methods on the ref instance
    // Since we can't easily access the ref from outside, we rely on the mock factory to return an object with methods
    // But functional component refs to class components... 
    // Let's redefine the mock to be a class or object that satisfies the interface.

    it('renders with correct label', () => {
        render(<Signature {...defaultProps} />);
        expect(screen.getByText('Sign Here')).toBeInTheDocument();
        expect(screen.getByTestId('mock-signature-canvas')).toBeInTheDocument();
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<Signature {...mandatoryProps} />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('has clear and save buttons', () => {
        render(<Signature {...defaultProps} />);
        expect(screen.getByText('Clear')).toBeInTheDocument();
        expect(screen.getByText('Save & Upload')).toBeInTheDocument();
    });
});
