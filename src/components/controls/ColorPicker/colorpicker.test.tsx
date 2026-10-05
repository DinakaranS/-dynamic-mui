import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColorPicker from './colorpicker';
import { ControlProps } from '../../../types';

describe('ColorPicker Control', () => {
    const mockOnChange = vi.fn();
    const defaultProps: ControlProps = {
        attributes: {
            id: 'test-color',
            value: '#000000',
            label: 'Pick a colour',
            presets: ['#ff0000', '#00ff00', '#0000ff'],
            MuiAttributes: {},
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders the label and a colour input', () => {
        render(<ColorPicker {...defaultProps} />);
        expect(screen.getByText('Pick a colour')).toBeInTheDocument();
        const colorInput = screen.getByLabelText('Pick a colour colour') as HTMLInputElement;
        expect(colorInput).toBeInTheDocument();
        expect(colorInput.type).toBe('color');
    });

    it('fires onChange with the hex value when the colour input changes', () => {
        mockOnChange.mockClear();
        render(<ColorPicker {...defaultProps} />);
        const colorInput = screen.getByLabelText('Pick a colour colour');
        fireEvent.change(colorInput, { target: { value: '#ff0000' } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-color', value: '#ff0000' }),
        );
    });

    it('fires onChange with the hex value when the hex field is edited', () => {
        mockOnChange.mockClear();
        render(<ColorPicker {...defaultProps} />);
        const hexInput = screen.getByLabelText('hex value');
        fireEvent.change(hexInput, { target: { value: '#123456' } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-color', value: '#123456' }),
        );
    });

    it('selects a preset swatch and fires onChange with that hex', () => {
        mockOnChange.mockClear();
        render(<ColorPicker {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('preset #00ff00'));
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-color', value: '#00ff00' }),
        );
    });
});
