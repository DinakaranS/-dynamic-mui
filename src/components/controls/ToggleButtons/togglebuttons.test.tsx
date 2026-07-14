import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToggleButtons from './togglebuttons';
import { ControlProps } from '../../../types';

describe('ToggleButtons Control', () => {
    const baseProps: ControlProps = {
        attributes: {
            id: 'align',
            value: null,
            options: [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
            ],
            label: 'Alignment',
        },
        rules: {},
        onChange: vi.fn(),
    };

    it('renders all options as buttons', () => {
        render(<ToggleButtons {...baseProps} />);
        expect(screen.getByRole('button', { name: 'Left' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Center' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Right' })).toBeInTheDocument();
    });

    it('renders the label', () => {
        render(<ToggleButtons {...baseProps} />);
        expect(screen.getByText('Alignment')).toBeInTheDocument();
    });

    it('fires onChange with the clicked value in single mode', () => {
        const onChange = vi.fn();
        render(<ToggleButtons {...baseProps} onChange={onChange} />);

        fireEvent.click(screen.getByRole('button', { name: 'Center' }));

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'align', value: 'center' }),
        );
    });

    it('accumulates selected values into an array in multiple mode', () => {
        const onChange = vi.fn();
        render(
            <ToggleButtons
                {...baseProps}
                attributes={{ ...baseProps.attributes, multiple: true, value: [] }}
                onChange={onChange}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Left' }));
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: ['left'] }),
        );

        fireEvent.click(screen.getByRole('button', { name: 'Right' }));
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: ['left', 'right'] }),
        );
    });

    it('normalizes string[] options', () => {
        render(
            <ToggleButtons
                {...baseProps}
                attributes={{ ...baseProps.attributes, options: ['a', 'b'] }}
            />,
        );
        expect(screen.getByRole('button', { name: 'a' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'b' })).toBeInTheDocument();
    });
});
