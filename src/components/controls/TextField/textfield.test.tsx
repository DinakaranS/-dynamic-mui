import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TextField from './textfield';
import { ControlProps } from '../../../types';

// Mock needed because we are testing the component in isolation
// and it might depend on context or other things.
// But TextField is mostly pure.

describe('TextField Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-input',
            value: '',
            MuiAttributes: {
                label: 'Test Label',
                placeholder: 'Enter text'
            }
        },
        onChange: mockOnChange
    };

    it('renders with correct label', () => {
        render(<TextField {...defaultProps} />);
        expect(screen.getByLabelText(/Test Label/i)).toBeInTheDocument();
    });

    it('calls onChange when typed into and blurred', () => {
        render(<TextField {...defaultProps} />);
        const input = screen.getByLabelText(/Test Label/i);
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.blur(input);
        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-input',
            value: 'Hello'
        }));
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Field is required' }]
            }
        };
        render(<TextField {...mandatoryProps} />);
        // The asterisk is rendered within the label
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('shows error when mandatory field is empty and touched', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Field is required' }]
            }
        };
        render(<TextField {...mandatoryProps} />);
        const input = screen.getByLabelText(/Test Label/i);

        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        expect(screen.getByText('Field is required')).toBeInTheDocument();
    });
});
