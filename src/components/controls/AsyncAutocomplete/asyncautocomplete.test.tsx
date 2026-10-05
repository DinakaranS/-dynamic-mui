import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AsyncAutocomplete from './asyncautocomplete';
import { ControlProps } from '../../../types';

const makeLoadOptions = () =>
    vi.fn().mockResolvedValue([
        { label: 'Apple', value: 'a' },
        { label: 'Apricot', value: 'b' },
    ]);

const baseProps = (overrides: Partial<ControlProps['attributes']> = {}): ControlProps => ({
    attributes: {
        id: 'fruit',
        value: null,
        label: 'Fruit Search',
        minChars: 1,
        debounceMs: 300,
        ...overrides,
    },
    rules: {},
    onChange: vi.fn(),
});

describe('AsyncAutocomplete Control', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the input with the label', () => {
        const loadOptions = makeLoadOptions();
        render(<AsyncAutocomplete {...baseProps({ loadOptions })} />);
        expect(screen.getByLabelText(/Fruit Search/i)).toBeInTheDocument();
    });

    it('typing (>= minChars) triggers loadOptions after the debounce and shows options', async () => {
        const loadOptions = makeLoadOptions();
        const props = baseProps({ loadOptions, debounceMs: 200 });
        render(<AsyncAutocomplete {...props} />);

        const input = screen.getByRole('combobox');
        input.focus();
        fireEvent.change(input, { target: { value: 'Ap' } });

        // Debounced call fires with the typed query.
        await waitFor(() => expect(loadOptions).toHaveBeenCalledWith('Ap'));

        // Returned options appear in the listbox.
        const listbox = await screen.findByRole('listbox');
        expect(within(listbox).getByText('Apple')).toBeInTheDocument();
        expect(within(listbox).getByText('Apricot')).toBeInTheDocument();
    });

    it('does NOT call loadOptions below minChars', async () => {
        const loadOptions = makeLoadOptions();
        const props = baseProps({ loadOptions, minChars: 3, debounceMs: 50 });
        render(<AsyncAutocomplete {...props} />);

        const input = screen.getByRole('combobox');
        input.focus();
        fireEvent.change(input, { target: { value: 'ap' } }); // 2 chars < 3

        await new Promise((r) => setTimeout(r, 150));
        expect(loadOptions).not.toHaveBeenCalled();
    });

    it('selecting an option emits { id, value, option }', async () => {
        const loadOptions = makeLoadOptions();
        const onChange = vi.fn();
        const props = { ...baseProps({ loadOptions, debounceMs: 100 }), onChange };
        render(<AsyncAutocomplete {...props} />);

        const input = screen.getByRole('combobox');
        input.focus();
        fireEvent.change(input, { target: { value: 'Ap' } });

        await waitFor(() => expect(loadOptions).toHaveBeenCalledWith('Ap'));

        const listbox = await screen.findByRole('listbox');
        fireEvent.click(within(listbox).getByText('Apple'));

        expect(onChange).toHaveBeenCalledWith({
            id: 'fruit',
            value: 'a',
            option: { label: 'Apple', value: 'a' },
        });
    });
});
