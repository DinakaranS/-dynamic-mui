import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

const tf = (id: string, label: string, extra: any = {}) => ({
    type: 'textfield',
    props: { id, MuiAttributes: { label } },
    layout: { row: 1, xs: 12 },
    ...extra,
});

describe('FormGenerator dynamic engine', () => {
    it('hides a field until its visibleWhen condition is met', () => {
        const data = [tf('a', 'Field A'), tf('b', 'Field B', { visibleWhen: { field: 'a', op: 'eq', value: 'yes' } })];

        const { rerender } = render(<FormGenerator guid="vis-1" data={data} patch={{ a: 'no' }} />);
        expect(screen.queryByLabelText('Field B')).toBeNull();

        rerender(<FormGenerator guid="vis-1" data={data} patch={{ a: 'yes' }} />);
        expect(screen.queryByLabelText('Field B')).not.toBeNull();
    });

    it('renders a computed field derived from other values', () => {
        const data = [
            tf('qty', 'Qty'),
            tf('price', 'Price'),
            { type: 'computed', props: { id: 'total', formula: 'qty * price', MuiAttributes: { label: 'Total' } }, formula: 'qty * price', layout: { row: 1, xs: 12 } },
        ];
        render(<FormGenerator guid="calc-1" data={data} patch={{ qty: 2, price: 5 }} />);
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    it('keeps a computed field value in sync in the store on change (not just on render)', () => {
        const data = [
            { type: 'numberfield', props: { id: 'qty', value: 2, MuiAttributes: { label: 'Qty' } }, layout: { row: 1, xs: 12 } },
            { type: 'numberfield', props: { id: 'price', value: 10, MuiAttributes: { label: 'Price' } }, layout: { row: 1, xs: 12 } },
            { type: 'computed', props: { id: 'total', MuiAttributes: { label: 'Total' } }, formula: 'qty * price', layout: { row: 2, xs: 12 } },
        ];
        render(<FormGenerator guid="calc-sync" data={data as any} />);
        expect(FormData('calc-sync').total).toBe(20); // 2 * 10 on initial render

        const qty = screen.getByLabelText('Qty');
        fireEvent.change(qty, { target: { value: '5' } });
        fireEvent.blur(qty);
        // The stored computed value is fresh immediately after the change (not stale).
        expect(FormData('calc-sync').total).toBe(50);
    });

    it('reports a requiredWhen error only when the condition holds', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('status', 'Status'),
            tf('reason', 'Reason', { requiredWhen: { field: 'status', op: 'eq', value: 'other' } }),
        ];
        render(<FormGenerator guid="req-1" data={data} patch={{ status: 'other' }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'reason')).toBe(true);
    });

    it('does NOT require the field when the requiredWhen condition is false', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('status', 'Status'),
            tf('reason', 'Reason', { requiredWhen: { field: 'status', op: 'eq', value: 'other' } }),
        ];
        render(<FormGenerator guid="req-2" data={data} patch={{ status: 'active' }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'reason')).toBe(false);
    });

    it('validates a cross-field rule (confirm must equal password)', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('password', 'Password'),
            tf('confirm', 'Confirm', {
                rules: { validation: [{ rule: 'equalsField', field: 'password', message: 'Passwords must match' }] },
            }),
        ];
        render(<FormGenerator guid="cf-1" data={data} patch={{ password: 'abc', confirm: 'xyz' }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'confirm' && e.rule === 'equalsField')).toBe(true);
    });

    it('resolves dynamic options from a parent field (dependsOn + optionsMap) and clears an invalid selection', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('country', 'Country'),
            {
                type: 'select',
                props: { id: 'state', MuiBoxAttributes: { label: 'State' } },
                dependsOn: 'country',
                optionsMap: { us: [{ value: 'ca', label: 'California' }], in: [{ value: 'ka', label: 'Karnataka' }] },
                layout: { row: 2, xs: 12 },
            },
        ];
        // With country=us and state=ca (valid) it stays; changing country to `in`
        // makes `ca` invalid → the engine drops it on the next change.
        render(<FormGenerator guid="dyn-1" data={data as any} patch={{ country: 'us', state: 'ca' }} onSubmit={onSubmit} />);
        expect(FormData('dyn-1').state).toBe('ca');

        // simulate the parent changing to a value where `ca` is no longer an option
        const input = screen.getByLabelText('Country');
        fireEvent.change(input, { target: { value: 'in' } });
        fireEvent.blur(input);
        expect(FormData('dyn-1').state).toBeUndefined();
    });

    it('renders a subform on the INITIAL patch when the parent value already matches', () => {
        const data = [
            {
                type: 'select',
                props: { id: 'condition', options: [{ value: 'good', label: 'Good' }, { value: 'repair', label: 'Needs repair' }], MuiBoxAttributes: { label: 'Condition' } },
                subforms: [{ conditionValue: 'repair', data: [tf('repairNotes', 'Repair details')] }],
                layout: { row: 1, xs: 12 },
            },
        ];
        // Parent value supplied via patch on first render — the subform must appear immediately.
        render(<FormGenerator guid="sub-init" data={data as any} patch={{ condition: 'repair' }} />);
        expect(screen.queryByLabelText('Repair details')).not.toBeNull();
    });

    it('does NOT render the subform on initial patch when the value does not match', () => {
        const data = [
            {
                type: 'select',
                props: { id: 'condition', options: [{ value: 'good', label: 'Good' }, { value: 'repair', label: 'Needs repair' }], MuiBoxAttributes: { label: 'Condition' } },
                subforms: [{ conditionValue: 'repair', data: [tf('repairNotes', 'Repair details')] }],
                layout: { row: 1, xs: 12 },
            },
        ];
        render(<FormGenerator guid="sub-init-2" data={data as any} patch={{ condition: 'good' }} />);
        expect(screen.queryByLabelText('Repair details')).toBeNull();
    });

    it('shows a requiredWhen field AND its error on the initial patch (no interaction needed)', () => {
        const onSubmit = vi.fn();
        const data = [
            { type: 'switch', props: { id: 'replaced', MuiFCLAttributes: { label: 'Replaced' } }, layout: { row: 1, xs: 12 } },
            tf('newId', 'New ID', {
                visibleWhen: { field: 'replaced', op: 'eq', value: true },
                requiredWhen: { field: 'replaced', op: 'eq', value: true },
            }),
        ];
        // Initialized (patched) into the state that reveals + requires the field.
        render(<FormGenerator guid="req-init" data={data as any} patch={{ replaced: true }} onSubmit={onSubmit} />);
        // Regex matcher: a required field's label carries an asterisk ("New ID *").
        expect(screen.queryByLabelText(/New ID/)).not.toBeNull(); // visible on initial patch
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'newId')).toBe(true); // required fired on initial patch
    });

    it('skips validation for fields hidden by visibleWhen', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('a', 'Field A'),
            tf('b', 'Field B', {
                visibleWhen: { field: 'a', op: 'eq', value: 'yes' },
                rules: { validation: [{ rule: 'mandatory', message: 'B required' }] },
            }),
        ];
        render(<FormGenerator guid="hid-1" data={data} patch={{ a: 'no' }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'b')).toBe(false);
    });
});
