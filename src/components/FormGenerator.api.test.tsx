import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, ClearFormData, FormApi } from './FormGenerator';

afterEach(() => ClearFormData());

const mandatory = (id: string, label: string) => ({
    type: 'textfield',
    props: { id, MuiAttributes: { label } },
    rules: { validation: [{ rule: 'mandatory', message: `${label} required` }] },
    layout: { row: 1, xs: 12 },
});

describe('FormGenerator imperative apiRef', () => {
    it('exposes getValues / setValues / validate / reset', () => {
        const ref = React.createRef<FormApi>();
        render(<FormGenerator guid="api-1" data={[mandatory('name', 'Name')]} apiRef={ref} />);

        // empty mandatory → invalid
        expect(ref.current!.validate()).toBe(false);
        expect(ref.current!.getErrors().some((e: any) => e.id === 'name')).toBe(true);

        // set a value → valid, and reflected in getValues
        ref.current!.setValues({ name: 'Ada' });
        expect(ref.current!.getValues().name).toBe('Ada');
        expect(ref.current!.validate()).toBe(true);

        // reset clears
        ref.current!.reset();
        expect(ref.current!.getValues().name).toBeUndefined();
    });

    it('submit() runs the same flow as the button and reports errors', () => {
        const onSubmit = vi.fn();
        const ref = React.createRef<FormApi>();
        render(<FormGenerator guid="api-2" data={[mandatory('email', 'Email')]} apiRef={ref} onSubmit={onSubmit} />);
        ref.current!.submit();
        expect(onSubmit).toHaveBeenCalled();
        expect(onSubmit.mock.calls[0][1].some((e: any) => e.id === 'email')).toBe(true);
    });
});

describe('FormGenerator submit-time error display', () => {
    it('shows the error on an untouched mandatory field after submit', () => {
        render(<FormGenerator guid="disp-1" data={[mandatory('name', 'Name')]} onSubmit={vi.fn()} />);
        // no error before submit
        expect(screen.queryByText('Name required')).toBeNull();
        fireEvent.click(screen.getByLabelText('button'));
        // control surfaced its error via submitTick
        expect(screen.getByText('Name required')).toBeInTheDocument();
    });
});

describe('FormGenerator validation summary + i18n', () => {
    it('shows a visible summary on failed submit when enabled', () => {
        render(<FormGenerator guid="sum-1" data={[mandatory('name', 'Name')]} validationSummary />);
        expect(screen.queryByRole('alert')).toBeNull();
        fireEvent.click(screen.getByLabelText('button'));
        expect(screen.getByRole('alert')).toHaveTextContent(/1 field/i);
    });

    it('localizes the summary and the requiredWhen message', () => {
        const onSubmit = vi.fn();
        const data = [
            { type: 'textfield', props: { id: 'a', MuiAttributes: { label: 'A' } }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'reason', MuiAttributes: { label: 'Reason' } }, requiredWhen: { field: 'a', op: 'empty' }, layout: { row: 2, xs: 12 } },
        ];
        render(
            <FormGenerator
                guid="sum-2"
                data={data as any}
                onSubmit={onSubmit}
                validationSummary
                messages={{ required: 'Requerido', errorSummary: '{n} problemas' }}
            />,
        );
        fireEvent.click(screen.getByLabelText('button'));
        // requiredWhen holds (a is empty) → 'reason' is required with the localized message
        const errors = onSubmit.mock.calls[0][1];
        const reasonErr = errors.find((e: any) => e.id === 'reason');
        expect(reasonErr.message).toBe('Requerido');
        expect(screen.getByRole('alert')).toHaveTextContent('1 problemas');
    });
});
