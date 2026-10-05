import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PhoneField from './phonefield';
import { ControlProps } from '../../../types';

describe('PhoneField Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-phone',
            value: '',
            label: 'Phone Number',
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders with the label', () => {
        render(<PhoneField {...defaultProps} />);
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });

    it('formats typed digits following the pattern', () => {
        render(<PhoneField {...defaultProps} />);
        const input = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
        fireEvent.change(input, { target: { value: '1234567890' } });
        expect(input.value).toContain('(123)');
        expect(input.value).toContain('456-7890');
    });

    it('calls onChange with the raw digits', () => {
        mockOnChange.mockClear();
        render(<PhoneField {...defaultProps} />);
        const input = screen.getByLabelText(/Phone Number/i);
        fireEvent.change(input, { target: { value: '1234567890' } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-phone',
                value: '1234567890',
            }),
        );
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps: ControlProps = {
            ...defaultProps,
            rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
        };
        render(<PhoneField {...mandatoryProps} />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });
});
