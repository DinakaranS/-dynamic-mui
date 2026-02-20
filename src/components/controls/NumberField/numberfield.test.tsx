import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NumberField from './numberfield';
import { ControlProps } from '../../../types';

describe('NumberField Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-number',
            value: '',
            MuiAttributes: {
                label: 'Test Number'
            }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders with correct label', () => {
        render(<NumberField {...defaultProps} />);
        expect(screen.getByLabelText(/Test Number/i)).toBeInTheDocument();
    });

    it('calls onChange when typed into', () => {
        render(<NumberField {...defaultProps} />);
        const input = screen.getByLabelText(/Test Number/i);
        fireEvent.change(input, { target: { value: '123' } });
        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-number',
            value: '123'
        }));
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<NumberField {...mandatoryProps} />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('shows error when mandatory field is empty and touched', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<NumberField {...mandatoryProps} />);
        const input = screen.getByLabelText(/Test Number/i);

        fireEvent.change(input, { target: { value: '' } });
        fireEvent.blur(input);

        expect(screen.getByText('Required')).toBeInTheDocument();
    });
});
