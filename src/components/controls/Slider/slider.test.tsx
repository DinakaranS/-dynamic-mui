import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Slider from './slider';
import { ControlProps } from '../../../types';

describe('Slider Control', () => {
    const mockOnChange = vi.fn();
    const baseProps: ControlProps = {
        attributes: {
            id: 'test-slider',
            value: 40,
            label: 'Volume',
            min: 0,
            max: 100,
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders with the label and one thumb for a number value', () => {
        render(<Slider {...baseProps} />);
        expect(screen.getByText('Volume')).toBeInTheDocument();
        const thumbs = screen.getAllByRole('slider');
        expect(thumbs).toHaveLength(1);
        expect(thumbs[0]).toHaveAttribute('aria-valuenow', '40');
    });

    it('renders two thumbs for a [20,60] range value with correct min/max', () => {
        const rangeProps: ControlProps = {
            ...baseProps,
            attributes: { ...baseProps.attributes, value: [20, 60] },
        };
        render(<Slider {...rangeProps} />);
        const thumbs = screen.getAllByRole('slider');
        expect(thumbs).toHaveLength(2);
        expect(thumbs[0]).toHaveAttribute('aria-valuenow', '20');
        expect(thumbs[1]).toHaveAttribute('aria-valuenow', '60');
        expect(thumbs[0]).toHaveAttribute('aria-valuemin', '0');
        expect(thumbs[0]).toHaveAttribute('aria-valuemax', '100');
    });

    it('fires onChange on keyboard interaction', () => {
        mockOnChange.mockClear();
        render(<Slider {...baseProps} />);
        const thumb = screen.getAllByRole('slider')[0];
        thumb.focus();
        fireEvent.keyDown(thumb, { key: 'ArrowRight' });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-slider' })
        );
    });
});
