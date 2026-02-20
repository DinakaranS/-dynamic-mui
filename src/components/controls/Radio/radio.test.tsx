import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Radio from './radio';
import { ControlProps } from '../../../types';

describe('Radio Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-radio',
            value: '',
            // Radio uses MuiFCLabels for options, not options prop
            MuiFCLabels: ['Option 1', 'Option 2'],
            MuiFLabel: 'Test Radio Group', // Group label
            MuiAttributes: {
                // Radio buttons props
            },
            MuiFCLAttributes: {
                // FormControlLabel props
            },
            // Legacy/unused in component but often present
            options: []
        },
        onChange: mockOnChange,
        rules: {}
    };

    it('renders options correctly', () => {
        render(<Radio {...defaultProps} />);
        expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Test Radio Group')).toBeInTheDocument();
    });

    it('calls onChange when option selected', () => {
        render(<Radio {...defaultProps} />);
        const option1 = screen.getByLabelText('Option 1');

        fireEvent.click(option1);

        expect(mockOnChange).toHaveBeenCalled();
        // The component calls onChange with { id, value: val } where val is the label text
        expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
            id: 'test-radio',
            value: 'Option 1'
        }));
    });

    it('renders asterisk when mandatory', () => {
        const mandatoryProps = {
            ...defaultProps,
            rules: {
                validation: [{ rule: 'mandatory', message: 'Required' }]
            }
        };
        render(<Radio {...mandatoryProps} />);

        // The Mui-required class should be on the FormLabel
        const label = screen.getByText('Test Radio Group');
        expect(label.className).toContain('Mui-required');
    });
});
