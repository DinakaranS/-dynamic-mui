import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

describe('visibleWhen clears hidden values', () => {
    const data = [
        { type: 'radio', props: { id: 'emp', MuiFLabel: 'Status', MuiFCLabels: [{ label: 'Employed', value: 'employed' }, { label: 'Student', value: 'student' }] }, layout: { row: 1, xs: 12 } },
        { type: 'textfield', props: { id: 'company', MuiAttributes: { label: 'Company' } }, visibleWhen: { field: 'emp', op: 'eq', value: 'employed' }, layout: { row: 2, xs: 12 } },
        { type: 'textfield', props: { id: 'school', MuiAttributes: { label: 'School' } }, visibleWhen: { field: 'emp', op: 'eq', value: 'student' }, layout: { row: 3, xs: 12 } },
    ] as any;

    it('drops a field value from the response when the field becomes hidden', () => {
        render(<FormGenerator guid="vh-1" data={data} patch={{ emp: 'employed', company: 'Acme' }} />);
        expect(FormData('vh-1').company).toBe('Acme');

        // Switch to Student → company field is hidden → its value is cleared.
        fireEvent.click(screen.getByLabelText('Student'));
        expect(FormData('vh-1').company).toBeUndefined();
        expect(FormData('vh-1').emp).toBe('student');
    });

    it('excludes an initially-hidden field value from the response', () => {
        render(<FormGenerator guid="vh-2" data={data} patch={{ emp: 'student', company: 'Stale' }} />);
        // company is hidden from the start (emp=student) → should not linger.
        expect(FormData('vh-2').company).toBeUndefined();
    });
});

// Render a one-form and return a submit() that returns response[guid].
const setup = (guid: string, data: any[], patch?: any) => {
    const onSubmit = vi.fn();
    render(<FormGenerator guid={guid} data={data} patch={patch} onSubmit={onSubmit} />);
    const submit = () => {
        fireEvent.click(screen.getByLabelText('button'));
        return onSubmit.mock.calls[onSubmit.mock.calls.length - 1][0][guid];
    };
    return { submit };
};

const tf = (id: string, label: string, extra: any = {}) => ({
    type: 'textfield', props: { id, MuiAttributes: { label }, ...extra }, layout: { row: 1, xs: 12 },
});

describe('FormGenerator value flow', () => {
    describe('initial value capture — props.value', () => {
        it('textfield with props.id', () => {
            const { submit } = setup('a1', [tf('name', 'Name', { value: 'John' })]);
            expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('John');
            expect(submit().name).toBe('John');
        });

        it('textfield with the id only at the top level (field.id)', () => {
            const data = [{ type: 'textfield', id: 'email', props: { value: 'a@b.com', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('a2', data);
            expect(submit().email).toBe('a@b.com');
        });

        it('numberfield', () => {
            const data = [{ type: 'numberfield', props: { id: 'qty', value: 7, MuiAttributes: { label: 'Qty' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('a3', data);
            expect(submit().qty).toBe(7);
        });

        it('checkbox (boolean true)', () => {
            const data = [{ type: 'checkbox', props: { id: 'agree', value: true, MuiFCLAttributes: { label: 'Agree' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('a4', data);
            expect(submit().agree).toBe(true);
        });

        it('switch (boolean true)', () => {
            const data = [{ type: 'switch', props: { id: 'active', value: true, MuiFCLAttributes: { label: 'Active' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('a5', data);
            expect(submit().active).toBe(true);
        });

        it('select (seeded option value)', () => {
            const data = [{ type: 'select', props: { id: 'role', value: 'admin', options: [{ value: 'admin', label: 'Admin' }], MuiBoxAttributes: { label: 'Role' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('a6', data);
            expect(submit().role).toBe('admin');
        });
    });

    describe('initial value via patch', () => {
        it('textfield with props.id', () => {
            const { submit } = setup('b1', [tf('name', 'Name')], { name: 'Ada' });
            expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada');
            expect(submit().name).toBe('Ada');
        });

        it('textfield with top-level field.id', () => {
            const data = [{ type: 'textfield', id: 'email', props: { MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('b2', data, { email: 'x@y.com' });
            expect(submit().email).toBe('x@y.com');
        });
    });

    describe('edit capture', () => {
        it('textfield edit (props.id)', () => {
            const { submit } = setup('c1', [tf('city', 'City')]);
            const input = screen.getByLabelText('City');
            fireEvent.change(input, { target: { value: 'London' } });
            fireEvent.blur(input);
            expect(submit().city).toBe('London');
        });

        it('textfield edit (top-level field.id)', () => {
            const data = [{ type: 'textfield', id: 'email', props: { MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('c2', data);
            const input = screen.getByLabelText('Email');
            fireEvent.change(input, { target: { value: 'a@b.com' } });
            fireEvent.blur(input);
            expect(submit().email).toBe('a@b.com');
        });

        it('checkbox toggle', () => {
            const data = [{ type: 'checkbox', props: { id: 'agree', MuiFCLAttributes: { label: 'Agree' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('c3', data);
            fireEvent.click(screen.getByLabelText('Agree'));
            expect(submit().agree).toBe(true);
        });

        it('switch toggle', () => {
            const data = [{ type: 'switch', props: { id: 'active', MuiFCLAttributes: { label: 'Active' } }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('c4', data);
            fireEvent.click(screen.getByLabelText('Active'));
            expect(submit().active).toBe(true);
        });

        it('radio select', () => {
            const data = [{ type: 'radio', props: { id: 'answer', MuiFLabel: 'Answer', MuiFCLabels: ['Yes', 'No'] }, layout: { row: 1, xs: 12 } }];
            const { submit } = setup('c5', data);
            fireEvent.click(screen.getByLabelText('Yes'));
            expect(submit().answer).toBe('Yes');
        });
    });

    describe('precedence', () => {
        it('patch overrides a schema props.value', () => {
            const { submit } = setup('d1', [tf('name', 'Name', { value: 'default' })], { name: 'fromPatch' });
            expect(submit().name).toBe('fromPatch');
        });

        it('a user edit overrides the initial value', () => {
            const { submit } = setup('d2', [tf('name', 'Name', { value: 'init' })]);
            const input = screen.getByLabelText('Name');
            fireEvent.change(input, { target: { value: 'edited' } });
            fireEvent.blur(input);
            expect(submit().name).toBe('edited');
        });
    });

    describe('FormData(guid) reflects the same values as onSubmit', () => {
        it('after an edit', () => {
            setup('e1', [tf('name', 'Name', { value: 'seed' })]);
            // seeded value visible via FormData immediately
            expect(FormData('e1').name).toBe('seed');
            const input = screen.getByLabelText('Name');
            fireEvent.change(input, { target: { value: 'typed' } });
            fireEvent.blur(input);
            expect(FormData('e1').name).toBe('typed');
        });
    });

    describe('mixed fields (different id styles + sources in one form)', () => {
        it('captures all of them', () => {
            const data = [
                { type: 'textfield', id: 'first', props: { value: 'Ada', MuiAttributes: { label: 'First' } }, layout: { row: 1, xs: 12 } }, // top-level id + initial
                tf('last', 'Last'),          // props.id, edited below
                { type: 'checkbox', props: { id: 'ok', value: true, MuiFCLAttributes: { label: 'OK' } }, layout: { row: 3, xs: 12 } }, // boolean initial
            ];
            const { submit } = setup('f1', data, { last: 'Lovelace' });
            const res = submit();
            expect(res.first).toBe('Ada');
            expect(res.last).toBe('Lovelace');
            expect(res.ok).toBe(true);
        });
    });
});
