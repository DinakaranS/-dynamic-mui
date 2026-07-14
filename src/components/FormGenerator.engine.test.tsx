import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormGenerator } from './FormGenerator';

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
