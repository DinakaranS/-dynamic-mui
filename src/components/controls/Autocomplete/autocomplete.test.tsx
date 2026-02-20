import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AutocompleteControl from './autocomplete';
import { ControlProps } from '../../../types';

describe('Autocomplete Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-autocomplete',
            value: '',
            options: [
                { value: 'opt1', label: 'Option 1' },
                { value: 'opt2', label: 'Option 2' }
            ],
            label: 'Test Autocomplete',
            MuiAttributes: {
                // Autocomplete props
            }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders with correct label', () => {
        render(<AutocompleteControl {...defaultProps} />);
        expect(screen.getByLabelText(/Test Autocomplete/i)).toBeInTheDocument();
    });

    it('opens dropdown and selects option', () => {
        render(<AutocompleteControl {...defaultProps} />);
        const input = screen.getByRole('combobox');

        fireEvent.mouseDown(input); // Open dropdown

        const option1 = screen.getByText('Option 1');
        fireEvent.click(option1);

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-autocomplete',
            value: expect.objectContaining({ value: 'opt1' })
        }));
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        const { container } = render(<AutocompleteControl {...mandatoryProps} />);
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
        render(<AutocompleteControl {...mandatoryProps} />);
        const input = screen.getByRole('combobox');

        fireEvent.focus(input);
        fireEvent.blur(input);

        expect(screen.getByText('Required')).toBeInTheDocument();
    });
});
