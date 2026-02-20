import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimePicker from './timepicker';
import { ControlProps } from '../../../types';
import dayjs from 'dayjs';

// Mock the helper
vi.mock('../../../util/helper', () => ({
    DateComponent: (name: string) => {
        return (props: any) => (
            <input
                data-testid="mock-time-picker"
                onChange={(e) => {
                    // Ensure we pass a valid dayjs object
                    props.onChange(dayjs('2023-01-01T' + e.target.value));
                }}
                value={props.value ? dayjs(props.value).format('HH:mm') : ''}
                required={props.slotProps?.textField?.required}
            />
        );
    }
}));

describe('TimePicker Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-time',
            value: null,
            MuiAttributes: {
                label: 'Test Time'
            }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders mock component', () => {
        render(<TimePicker {...defaultProps} />);
        expect(screen.getByTestId('mock-time-picker')).toBeInTheDocument();
    });

    it('calls onChange when time typed', () => {
        render(<TimePicker {...defaultProps} />);
        const input = screen.getByTestId('mock-time-picker');

        fireEvent.change(input, { target: { value: '10:00' } });

        expect(mockOnChange).toHaveBeenCalled();
    });

    it('renders asterisk/required when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<TimePicker {...mandatoryProps} />);
        const input = screen.getByTestId('mock-time-picker');
        expect(input).toHaveAttribute('required');
    });
});
