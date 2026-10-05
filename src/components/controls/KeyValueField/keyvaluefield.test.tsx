import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KeyValueField from './keyvaluefield';
import { ControlProps } from '../../../types';

describe('KeyValueField Control', () => {
    const makeProps = (overrides: Partial<ControlProps['attributes']> = {}): ControlProps => ({
        attributes: {
            id: 'test-kv',
            value: { name: 'Alice', role: 'admin' },
            label: 'Metadata',
            ...overrides,
        },
        onChange: vi.fn(),
        rules: {},
    });

    it('renders existing pairs from an object value', () => {
        render(<KeyValueField {...makeProps()} />);
        expect(screen.getByDisplayValue('name')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
        expect(screen.getByDisplayValue('role')).toBeInTheDocument();
        expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
    });

    it('fires onChange with the updated map when a value is edited', () => {
        const onChange = vi.fn();
        render(<KeyValueField {...makeProps()} onChange={onChange} />);
        const valueInput = screen.getByDisplayValue('Alice');
        fireEvent.change(valueInput, { target: { value: 'Bob' } });

        expect(onChange).toHaveBeenCalled();
        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.id).toBe('test-kv');
        expect(lastArg.value).toEqual({ name: 'Bob', role: 'admin' });
        expect(Array.isArray(lastArg.option)).toBe(true);
    });

    it('adds a row when Add is clicked', () => {
        const onChange = vi.fn();
        render(<KeyValueField {...makeProps()} onChange={onChange} />);
        const keysBefore = screen.getAllByDisplayValue(/name|role/).length;
        fireEvent.click(screen.getByRole('button', { name: /add/i }));

        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.option.length).toBe(3);
        // new empty row rendered
        expect(screen.getAllByRole('textbox').length).toBeGreaterThan(keysBefore);
    });

    it('removes a row and fires onChange with the updated map', () => {
        const onChange = vi.fn();
        render(<KeyValueField {...makeProps()} onChange={onChange} />);
        const removeButtons = screen.getAllByRole('button', { name: /remove/i });
        fireEvent.click(removeButtons[0]);

        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastArg.value).toEqual({ role: 'admin' });
        expect(lastArg.option.length).toBe(1);
    });

    it('hydrates from an array of {key,value}', () => {
        render(
            <KeyValueField
                {...makeProps({ value: [{ key: 'a', value: '1' }] })}
            />,
        );
        expect(screen.getByDisplayValue('a')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });
});
