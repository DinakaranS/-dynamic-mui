import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Rating from './rating';
import { ControlProps } from '../../../types';

describe('Rating Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-rating',
            value: 0,
            label: 'Rate us',
            MuiAttributes: { max: 5 },
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders the label and star radios', () => {
        render(<Rating {...defaultProps} />);
        expect(screen.getByText('Rate us')).toBeInTheDocument();
        // MUI Rating renders radio inputs with aria-labels like "3 Stars".
        expect(screen.getByLabelText('3 Stars')).toBeInTheDocument();
    });

    it('fires onChange with the numeric value when a star is clicked', () => {
        mockOnChange.mockClear();
        render(<Rating {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('3 Stars'));
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-rating', value: 3 })
        );
    });

    it('renders required asterisk on the label when mandatory', () => {
        const mandatoryProps: ControlProps = {
            ...defaultProps,
            rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
        };
        render(<Rating {...mandatoryProps} />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });
});
