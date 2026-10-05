import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MatrixField from './matrixfield';
import { ControlProps } from '../../../types';

describe('MatrixField Control', () => {
    const baseProps: ControlProps = {
        attributes: {
            id: 'satisfaction',
            label: 'How satisfied are you?',
            rows: [
                { id: 'q1', label: 'Quality' },
                { id: 'q2', label: 'Support' },
            ],
            columns: [
                { value: 'low', label: 'Low' },
                { value: 'med', label: 'Medium' },
                { value: 'high', label: 'High' },
            ],
        },
        onChange: vi.fn(),
        rules: {},
    };

    it('renders a radio cell for every row × column', () => {
        render(<MatrixField {...baseProps} />);
        const radios = screen.getAllByRole('radio');
        expect(radios.length).toBe(2 * 3);
    });

    it('renders the label and column headers', () => {
        render(<MatrixField {...baseProps} />);
        expect(screen.getByText('How satisfied are you?')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
        expect(screen.getByText('Medium')).toBeInTheDocument();
        expect(screen.getByText('High')).toBeInTheDocument();
        expect(screen.getByText('Quality')).toBeInTheDocument();
        expect(screen.getByText('Support')).toBeInTheDocument();
    });

    it('selecting a cell fires onChange with { [rowId]: colValue }', () => {
        const onChange = vi.fn();
        render(<MatrixField {...baseProps} onChange={onChange} />);
        const cell = screen.getByLabelText('Quality High');
        fireEvent.click(cell);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'satisfaction',
                value: { q1: 'high' },
            })
        );
    });

    it('multiple mode accumulates an array for a row', () => {
        const onChange = vi.fn();
        const props: ControlProps = {
            ...baseProps,
            attributes: { ...baseProps.attributes, multiple: true },
            onChange,
        };
        const { rerender } = render(<MatrixField {...props} />);

        // checkboxes instead of radios
        expect(screen.getAllByRole('checkbox').length).toBe(2 * 3);

        fireEvent.click(screen.getByLabelText('Quality Low'));
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: { q1: ['low'] } })
        );

        // feed accumulated value back in, then add another for same row
        rerender(
            <MatrixField
                {...props}
                attributes={{ ...props.attributes, value: { q1: ['low'] } }}
            />
        );
        fireEvent.click(screen.getByLabelText('Quality High'));
        expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({ value: { q1: ['low', 'high'] } })
        );
    });

    it('normalizes string rows and columns', () => {
        const props: ControlProps = {
            attributes: {
                id: 'plain',
                rows: ['Row A', 'Row B'],
                columns: ['Yes', 'No'],
            },
            onChange: vi.fn(),
            rules: {},
        };
        render(<MatrixField {...props} />);
        expect(screen.getAllByRole('radio').length).toBe(2 * 2);
        expect(screen.getByText('Row A')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
    });
});
