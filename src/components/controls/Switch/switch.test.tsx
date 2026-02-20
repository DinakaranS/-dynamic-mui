import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Switch from './switch';
import { ControlProps } from '../../../types';

describe('Switch Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-switch',
            value: false,
            MuiFCLAttributes: {
                label: 'Test Switch'
            }
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders with correct label', () => {
        render(<Switch {...defaultProps} />);
        expect(screen.getByLabelText(/Test Switch/i)).toBeInTheDocument();
    });

    it('calls onChange when clicked', () => {
        const { container } = render(<Switch {...defaultProps} />);
        // Use querySelector to directly find the input, bypassing accessibility role issues in test env
        const switchInput = container.querySelector('input[type="checkbox"]');

        expect(switchInput).toBeInTheDocument();
        fireEvent.click(switchInput!);

        expect(mockOnChange).toHaveBeenCalled();
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-switch',
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
        render(<Switch {...mandatoryProps} />);
        const asterisks = screen.getAllByText('*');
        expect(asterisks.length).toBeGreaterThan(0);
    });
});
