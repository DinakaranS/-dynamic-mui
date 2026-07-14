import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CascadeSelect from './cascadeselect';
import { ControlProps } from '../../../types';

const optionsMap = {
    us: [{ value: 'ca', label: 'California' }],
    in: [{ value: 'ka', label: 'Karnataka' }],
};

const makeProps = (overrides: Partial<ControlProps> = {}): ControlProps => ({
    attributes: {
        id: 'child',
        value: '',
        label: 'Region',
        parentValue: 'us',
        optionsMap,
        ...(overrides.attributes || {}),
    },
    onChange: overrides.onChange,
    rules: overrides.rules || {},
});

describe('CascadeSelect Control', () => {
    it('renders options for the current parentValue (us)', () => {
        render(<CascadeSelect {...makeProps()} />);
        fireEvent.mouseDown(screen.getByLabelText('Region'));
        const listbox = within(screen.getByRole('listbox'));
        expect(listbox.getByText('California')).toBeInTheDocument();
        expect(listbox.queryByText('Karnataka')).not.toBeInTheDocument();
    });

    it('selecting an option fires onChange with its value', () => {
        const onChange = vi.fn();
        render(<CascadeSelect {...makeProps({ onChange })} />);
        fireEvent.mouseDown(screen.getByLabelText('Region'));
        fireEvent.click(within(screen.getByRole('listbox')).getByText('California'));
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'child', value: 'ca' }),
        );
    });

    it('switches available options when parentValue changes to in', () => {
        const { rerender } = render(<CascadeSelect {...makeProps()} />);

        rerender(
            <CascadeSelect
                {...makeProps({ attributes: { id: 'child', value: '', label: 'Region', parentValue: 'in', optionsMap } })}
            />,
        );

        fireEvent.mouseDown(screen.getByLabelText('Region'));
        const listbox = within(screen.getByRole('listbox'));
        expect(listbox.getByText('Karnataka')).toBeInTheDocument();
        expect(listbox.queryByText('California')).not.toBeInTheDocument();
    });

    it('clears a stale selection when parentValue changes', () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <CascadeSelect {...makeProps({ onChange, attributes: { id: 'child', value: 'ca', label: 'Region', parentValue: 'us', optionsMap } })} />,
        );

        rerender(
            <CascadeSelect {...makeProps({ onChange, attributes: { id: 'child', value: 'ca', label: 'Region', parentValue: 'in', optionsMap } })} />,
        );

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'child', value: '' }),
        );
    });
});
