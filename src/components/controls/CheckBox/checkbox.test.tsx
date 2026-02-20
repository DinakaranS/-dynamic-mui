import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckBox from './checkbox';
import { ControlProps } from '../../../types';

describe('CheckBox Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-checkbox',
            value: false,
            MuiFCLAttributes: {
                label: 'Test Checkbox'
            },
            MuiAttributes: {}
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders with correct label', () => {
        render(<CheckBox {...defaultProps} />);
        expect(screen.getByLabelText(/Test Checkbox/i)).toBeInTheDocument();
    });

    it('calls onChange when clicked', () => {
        render(<CheckBox {...defaultProps} />);
        const checkbox = screen.getByLabelText(/Test Checkbox/i);

        fireEvent.click(checkbox);

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-checkbox',
            value: true
        }));
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<CheckBox {...mandatoryProps} />);
        const asterisks = screen.getAllByText('*');
        expect(asterisks.length).toBeGreaterThan(0);
        expect(asterisks[0]).toBeInTheDocument();
    });

    it('shows error when mandatory checkbox is unchecked', () => {
        const mandatoryProps = {
            ...defaultProps,
            attributes: {
                ...defaultProps.attributes,
                value: true // Start checked
            },
            rules: {
                validation: [{ rule: 'mandatory', message: 'Must be checked' }]
            }
        };
        render(<CheckBox {...mandatoryProps} />);
        const checkbox = screen.getByLabelText(/Test Checkbox/i);

        // Uncheck it
        fireEvent.click(checkbox);

        expect(screen.getByText('Must be checked')).toBeInTheDocument();
    });
});
