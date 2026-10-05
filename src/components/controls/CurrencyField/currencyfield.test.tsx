import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CurrencyField from './currencyfield';
import { ControlProps } from '../../../types';

describe('CurrencyField Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-currency',
            value: '',
            label: 'Amount',
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders with the label', () => {
        render(<CurrencyField {...defaultProps} />);
        expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    });

    it('shows prefix and thousand separators for typed value', () => {
        render(<CurrencyField {...defaultProps} />);
        const input = screen.getByLabelText(/Amount/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '1234567' } });
        expect(input.value).toContain('$');
        expect(input.value).toContain('1,234,567');
    });

    it('calls onChange with the numeric string value', () => {
        mockOnChange.mockClear();
        render(<CurrencyField {...defaultProps} />);
        const input = screen.getByLabelText(/Amount/i);
        fireEvent.change(input, { target: { value: '1234567' } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-currency',
                value: '1234567.00',
            }),
        );
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps: ControlProps = {
            ...defaultProps,
            rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
        };
        render(<CurrencyField {...mandatoryProps} />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });
});
