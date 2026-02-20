import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DateTime from './datetime';
import { ControlProps } from '../../../types';
import dayjs from 'dayjs';

// Mock the helper to avoid complex MUI DatePicker interaction
vi.mock('../../../util/helper', () => ({
    DateComponent: (name: string) => {
        return (props: any) => (
            <input
                data-testid="mock-date-picker"
                onChange={(e) => props.onChange(dayjs(e.target.value))}
                value={props.value ? dayjs(props.value).format('YYYY-MM-DD') : ''}
                required={props.slotProps?.textField?.required}
            />
        );
    }
}));

describe('DateTime Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-datetime',
            value: null,
            name: 'DatePicker',
            MuiAttributes: {
                label: 'Test Date'
            }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders mock component', () => {
        render(<DateTime {...defaultProps} />);
        expect(screen.getByTestId('mock-date-picker')).toBeInTheDocument();
    });

    it('calls onChange when date selected', () => {
        render(<DateTime {...defaultProps} />);
        const input = screen.getByTestId('mock-date-picker');

        fireEvent.change(input, { target: { value: '2023-01-01' } });

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-datetime',
            value: expect.any(Object) // dayjs object
        }));
    });

    it('renders asterisk/required when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<DateTime {...mandatoryProps} />);
        const input = screen.getByTestId('mock-date-picker');
        expect(input).toHaveAttribute('required');
    });
});
