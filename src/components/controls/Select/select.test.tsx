import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Select from './select';
import { ControlProps } from '../../../types';

describe('Select Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-select',
            value: '',
            options: [
                { value: 'opt1', label: 'Option 1' },
                { value: 'opt2', label: 'Option 2' }
            ],
            MuiAttributes: {
                // Autocomplete props
            },
            MuiBoxAttributes: {
                label: 'Test Select'
            }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders with correct label', () => {
        render(<Select {...defaultProps} />);
        expect(screen.getByLabelText(/Test Select/i)).toBeInTheDocument();
    });

    it('opens dropdown and selects option', () => {
        render(<Select {...defaultProps} />);
        // Helper to open: clicking the combobox or label usually works
        const input = screen.getByRole('combobox');
        fireEvent.mouseDown(input); // MUI Autocomplete often reacts to mouseDown

        // Find option in portal
        const option1 = screen.getByText('Option 1');
        fireEvent.click(option1);

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-select',
            value: 'opt1'
        }));
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        // Use container lookup to be sure
        const { container } = render(<Select {...mandatoryProps} />);
        const input = container.querySelector('input');
        expect(input).toHaveAttribute('required');
    });

    it('shows error when mandatory field is empty and touched', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<Select {...mandatoryProps} />);
        const input = screen.getByRole('combobox');

        fireEvent.focus(input);
        fireEvent.blur(input);

        expect(screen.getByText('Required')).toBeInTheDocument();
    });
});
