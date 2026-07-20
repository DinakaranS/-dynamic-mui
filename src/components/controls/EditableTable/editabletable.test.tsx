import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditableTable from './editabletable';
import { ControlProps } from '../../../types';

describe('EditableTable Control', () => {
    const makeProps = (overrides: Partial<ControlProps['attributes']> = {}): ControlProps => ({
        attributes: {
            id: 'test-table',
            label: 'Line items',
            columns: [
                { key: 'name', label: 'Name' },
                { key: 'qty', label: 'Qty', type: 'number' },
            ],
            value: [
                { name: 'Widget', qty: '2' },
                { name: 'Gadget', qty: '5' },
            ],
            ...overrides,
        },
        onChange: vi.fn(),
        rules: {},
    });

    it('renders column headers and a field per cell for initial rows', () => {
        render(<EditableTable {...makeProps()} />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Qty')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Widget')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Gadget')).toBeInTheDocument();
        // 2 columns x 2 rows = 4 editable cells
        expect(screen.getByDisplayValue('2')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    });

    it('fires onChange with the updated rows when a cell is edited', () => {
        const onChange = vi.fn();
        render(<EditableTable {...makeProps()} onChange={onChange} />);
        fireEvent.change(screen.getByDisplayValue('Widget'), {
            target: { value: 'Sprocket' },
        });

        expect(onChange).toHaveBeenCalled();
        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.id).toBe('test-table');
        expect(Array.isArray(lastArg.value)).toBe(true);
        expect(lastArg.value[0].name).toBe('Sprocket');
        expect(lastArg.value[1].name).toBe('Gadget');
    });

    it('adds a row when Add row is clicked', () => {
        const onChange = vi.fn();
        render(<EditableTable {...makeProps()} onChange={onChange} />);
        const inputsBefore = screen.getAllByRole('textbox').length;
        fireEvent.click(screen.getByRole('button', { name: /add row/i }));

        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.value.length).toBe(3);
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(inputsBefore);
    });

    it('removes a row and fires onChange with the shorter array', () => {
        const onChange = vi.fn();
        render(<EditableTable {...makeProps()} onChange={onChange} />);
        const removeButtons = screen.getAllByRole('button', { name: /remove row/i });
        fireEvent.click(removeButtons[0]);

        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.value.length).toBe(1);
        expect(lastArg.value[0].name).toBe('Gadget');
    });
});
