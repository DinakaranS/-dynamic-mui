import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData, FormApi } from './FormGenerator';

afterEach(() => ClearFormData());

// ---------- schema helpers ----------
const tf = (id: string, label: string, extra: any = {}) => ({
    type: 'textfield',
    props: { id, MuiAttributes: { label } },
    layout: { row: 1, xs: 12 },
    ...extra,
});
// textfield carrying a schema-declared props.value
const tfv = (id: string, label: string, value: any, extra: any = {}) => ({
    type: 'textfield',
    props: { id, value, MuiAttributes: { label } },
    layout: { row: 1, xs: 12 },
    ...extra,
});
// textfield whose id is only at the top level (field.id)
const tfTop = (id: string, label: string, extra: any = {}) => ({
    type: 'textfield',
    id,
    props: { MuiAttributes: { label } },
    layout: { row: 1, xs: 12 },
    ...extra,
});
const computed = (id: string, label: string, formula: string) => ({
    type: 'computed',
    props: { id, formula, MuiAttributes: { label } },
    formula,
    layout: { row: 1, xs: 12 },
});

// Edit a textfield (value is emitted on blur).
const editText = (label: string, value: string) => {
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
};

// Render one form; submit() returns response[guid] captured by onSubmit.
const setup = (guid: string, data: any[], patch?: any, extra: any = {}) => {
    const onSubmit = vi.fn();
    const utils = render(
        <FormGenerator guid={guid} data={data} patch={patch} onSubmit={onSubmit} {...extra} />,
    );
    const submit = () => {
        fireEvent.click(screen.getByLabelText('button'));
        return onSubmit.mock.calls[onSubmit.mock.calls.length - 1][0][guid];
    };
    const errorsOf = () => onSubmit.mock.calls[onSubmit.mock.calls.length - 1][1];
    return { ...utils, submit, errorsOf, onSubmit };
};

// =====================================================================
describe('DEEP: value capture', () => {
    it('seeds props.value into the store before any edit', () => {
        setup('v-seed', [tfv('name', 'Name', 'John')]);
        expect(FormData('v-seed').name).toBe('John');
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('John');
    });

    it('patch takes precedence over schema props.value', () => {
        const { submit } = setup('v-prec', [tfv('name', 'Name', 'default')], { name: 'fromPatch' });
        expect(submit().name).toBe('fromPatch');
    });

    it('captures a value for a field whose id is only at the top level', () => {
        const { submit } = setup('v-top', [tfTop('email', 'Email')]);
        editText('Email', 'a@b.com');
        expect(submit().email).toBe('a@b.com');
    });

    it('a partial patch preserves a prior user edit (merge, not replace)', () => {
        const data = [tf('a', 'A'), tf('b', 'B')];
        const { rerender } = render(<FormGenerator guid="v-merge" data={data} patch={{}} />);
        editText('A', 'edited-a');
        expect(FormData('v-merge').a).toBe('edited-a');
        // A later partial patch only about b must not wipe the edit to a.
        rerender(<FormGenerator guid="v-merge" data={data} patch={{ b: 'patched-b' }} />);
        expect(FormData('v-merge').a).toBe('edited-a');
        expect(FormData('v-merge').b).toBe('patched-b');
    });

    it('changing the patch re-hydrates a field value', () => {
        const data = [tf('name', 'Name')];
        const { rerender } = render(<FormGenerator guid="v-rehydrate" data={data} patch={{ name: 'one' }} />);
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('one');
        rerender(<FormGenerator guid="v-rehydrate" data={data} patch={{ name: 'two' }} />);
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('two');
    });

    it('a user edit survives a re-render that reuses the SAME patch object reference', () => {
        const data = [tf('name', 'Name')];
        const stable = { name: 'seed' };
        const { rerender } = render(<FormGenerator guid="v-edit" data={data} patch={stable} />);
        editText('Name', 'typed');
        // Re-render reusing the identical object — useUpdateEffect does not fire.
        rerender(<FormGenerator guid="v-edit" data={data} patch={stable} />);
        expect(FormData('v-edit').name).toBe('typed');
    });

    // BUG: patch re-hydration keys on reference identity (useUpdateEffect deps=[patch]),
    // not content. Passing a *new* patch object with identical content — the very common
    // `patch={{ name: 'seed' }}` inline literal, recreated on every parent render — re-fires
    // the hydration and clobbers the user's in-progress edit back to the patch value.
    // Repro: edit a patched field to 'typed', re-render with an equal-but-new patch object.
    // Expected: FormData.name === 'typed' (edit preserved). Actual: 'seed' (edit lost).
    // Source: FormGenerator.tsx:230-232 useUpdateEffect([patch]) -> setNewPatch;
    //         helper.tsx:140 response[guid] = { ...response[guid], ...patch } (patch wins).
    it('a new-but-equal patch object preserves the user edit (fixed)', () => {
        const data = [tf('name', 'Name')];
        const { rerender } = render(<FormGenerator guid="v-edit-bug" data={data} patch={{ name: 'seed' }} />);
        editText('Name', 'typed');
        rerender(<FormGenerator guid="v-edit-bug" data={data} patch={{ name: 'seed' }} />); // new ref, same content
        expect(FormData('v-edit-bug').name).toBe('typed');
    });
});

// =====================================================================
describe('DEEP: computed / formula fields', () => {
    it('writes the computed value into the response so it submits', () => {
        const data = [tf('qty', 'Qty'), tf('price', 'Price'), computed('total', 'Total', 'qty * price')];
        const { submit } = setup('c-submit', data, { qty: 4, price: 5 });
        expect(submit().total).toBe(20);
    });

    it('recomputes after an edit to a referenced field', () => {
        const data = [tf('qty', 'Qty'), computed('total', 'Total', 'qty * 10')];
        setup('c-recompute', data, { qty: 2 });
        expect(screen.getByDisplayValue('20')).toBeInTheDocument();
        editText('Qty', '7');
        expect(screen.getByDisplayValue('70')).toBeInTheDocument();
        expect(FormData('c-recompute').total).toBe(70);
    });

    it('treats a missing referenced field as 0', () => {
        const data = [tf('qty', 'Qty'), computed('total', 'Total', 'qty * price')];
        const { submit } = setup('c-missing', data, { qty: 3 }); // price never provided
        expect(submit().total).toBe(0);
    });

    it('an empty/invalid formula yields "" (not NaN)', () => {
        const data = [computed('bad', 'Bad', '   ')];
        const { submit } = setup('c-empty', data);
        expect(submit().bad).toBe('');
    });
});

// =====================================================================
describe('DEEP: visibleWhen', () => {
    it('renders nothing for a hidden field', () => {
        const data = [tf('a', 'A'), tf('b', 'B', { visibleWhen: { field: 'a', op: 'eq', value: 'go' } })];
        setup('vw-null', data, { a: 'stop' });
        expect(screen.queryByLabelText('B')).toBeNull();
    });

    it('does NOT block submit on a hidden mandatory field', () => {
        const data = [
            tf('a', 'A'),
            tf('b', 'B', {
                visibleWhen: { field: 'a', op: 'eq', value: 'go' },
                rules: { validation: [{ rule: 'mandatory', message: 'B required' }] },
            }),
        ];
        const { submit, errorsOf } = setup('vw-skip', data, { a: 'stop' });
        submit();
        expect(errorsOf().some((e: any) => e.id === 'b')).toBe(false);
    });

    it('DOES block submit once the field becomes visible via an edit', () => {
        const data = [
            tf('a', 'A'),
            tf('b', 'B', {
                visibleWhen: { field: 'a', op: 'eq', value: 'go' },
                rules: { validation: [{ rule: 'mandatory', message: 'B required' }] },
            }),
        ];
        const { submit, errorsOf } = setup('vw-flip', data, { a: 'stop' });
        editText('A', 'go'); // flip visibility on
        // NOTE: query by id — a `mandatory` rule makes MUI render the label as "B *",
        // so an exact getByLabelText('B') would (misleadingly) miss the now-visible field.
        expect(document.getElementById('b')).not.toBeNull();
        submit();
        expect(errorsOf().some((e: any) => e.id === 'b')).toBe(true);
    });
});

// =====================================================================
describe('DEEP: disabledWhen', () => {
    it('disables the control when the condition holds', () => {
        const data = [
            tf('locked', 'Locked'),
            tf('target', 'Target', { disabledWhen: { field: 'locked', op: 'eq', value: 'yes' } }),
        ];
        setup('dw-1', data, { locked: 'yes' });
        expect((screen.getByLabelText('Target') as HTMLInputElement).disabled).toBe(true);
    });

    it('leaves the control enabled when the condition is false', () => {
        const data = [
            tf('locked', 'Locked'),
            tf('target', 'Target', { disabledWhen: { field: 'locked', op: 'eq', value: 'yes' } }),
        ];
        setup('dw-2', data, { locked: 'no' });
        expect((screen.getByLabelText('Target') as HTMLInputElement).disabled).toBe(false);
    });
});

// =====================================================================
describe('DEEP: requiredWhen', () => {
    it('requires the field only when the condition holds; uses requiredMessage', () => {
        const data = [
            tf('status', 'Status'),
            tf('reason', 'Reason', {
                requiredWhen: { field: 'status', op: 'eq', value: 'other' },
                requiredMessage: 'Reason needed',
            }),
        ];
        const { submit, errorsOf } = setup('rw-1', data, { status: 'other' });
        submit();
        const err = errorsOf().find((e: any) => e.id === 'reason');
        expect(err).toBeTruthy();
        expect(err.message).toBe('Reason needed');
    });

    it('does not require when the condition is false', () => {
        const data = [
            tf('status', 'Status'),
            tf('reason', 'Reason', { requiredWhen: { field: 'status', op: 'eq', value: 'other' } }),
        ];
        const { submit, errorsOf } = setup('rw-2', data, { status: 'active' });
        submit();
        expect(errorsOf().some((e: any) => e.id === 'reason')).toBe(false);
    });

    it('flips dynamically with an edit', () => {
        const data = [
            tf('status', 'Status'),
            tf('reason', 'Reason', { requiredWhen: { field: 'status', op: 'eq', value: 'other' } }),
        ];
        const { submit, errorsOf } = setup('rw-3', data, { status: 'active' });
        editText('Status', 'other');
        submit();
        expect(errorsOf().some((e: any) => e.id === 'reason')).toBe(true);
    });

    it('uses a localized messages.required when no requiredMessage', () => {
        const data = [
            tf('status', 'Status'),
            tf('reason', 'Reason', { requiredWhen: { field: 'status', op: 'eq', value: 'other' } }),
        ];
        const { submit, errorsOf } = setup('rw-4', data, { status: 'other' }, {
            messages: { required: 'Requerido' },
        });
        submit();
        expect(errorsOf().find((e: any) => e.id === 'reason').message).toBe('Requerido');
    });
});

// =====================================================================
describe('DEEP: cross-field validation', () => {
    it('equalsField: error on mismatch, clears after edit to match', () => {
        const data = [
            tf('password', 'Password'),
            tf('confirm', 'Confirm', {
                rules: { validation: [{ rule: 'equalsField', field: 'password', message: 'must match' }] },
            }),
        ];
        const { submit, errorsOf } = setup('cf-eq', data, { password: 'abc', confirm: 'xyz' });
        submit();
        expect(errorsOf().some((e: any) => e.id === 'confirm')).toBe(true);
        editText('Confirm', 'abc');
        submit();
        expect(errorsOf().some((e: any) => e.id === 'confirm')).toBe(false);
    });

    const gtData = [
        tf('min', 'Min'),
        tf('max', 'Max', {
            rules: { validation: [{ rule: 'gtField', field: 'min', message: 'max must exceed min' }] },
        }),
    ];

    it('gtField: errors when max is not greater than min', () => {
        const { submit, errorsOf } = setup('cf-gt-bad', gtData, { min: 10, max: 5 });
        submit();
        expect(errorsOf().some((e: any) => e.id === 'max')).toBe(true);
    });

    it('gtField: passes when max exceeds min', () => {
        const { submit, errorsOf } = setup('cf-gt-good', gtData, { min: 10, max: 20 });
        submit();
        expect(errorsOf().some((e: any) => e.id === 'max')).toBe(false);
    });

    it('lteField: valid when less-than-or-equal', () => {
        const data = [
            tf('cap', 'Cap'),
            tf('amount', 'Amount', {
                rules: { validation: [{ rule: 'lteField', field: 'cap', message: 'over cap' }] },
            }),
        ];
        const { submit, errorsOf } = setup('cf-lte', data, { cap: 100, amount: 100 });
        submit();
        expect(errorsOf().some((e: any) => e.id === 'amount')).toBe(false);
    });

    // Reference: a standard (non-cross) validator on an empty OPTIONAL field does NOT
    // fire — this is the documented convention (getErrors: `if (!fieldValue && !isMandatory) return`).
    it('a normal validator (email) on an empty optional field does not fire', () => {
        const data = [
            tf('a', 'A'),
            tf('mail', 'Mail', { rules: { validation: [{ rule: 'email', message: 'bad email' }] } }),
        ];
        const { submit, errorsOf } = setup('cf-optional-normal', data);
        submit();
        expect(errorsOf().some((e: any) => e.id === 'mail')).toBe(false);
    });

    // BUG: numeric cross-field validators (gtField/gteField/ltField/lteField) fire on an
    // OPTIONAL field that is left EMPTY. getErrors runs the cross-field branch with no
    // empty-value short-circuit (unlike the normal-validator branch just below it), so two
    // blanks become NaN and `NaN > NaN` === false => a spurious "max must exceed min" error
    // on an untouched, non-required form. equalsField happens to pass ('' === '') which makes
    // the inconsistency worse.
    // Repro: a field whose only rule is gtField, submit an empty form.
    // Expected: no error for 'max'. Actual: error present.
    // Source: FormGenerator.tsx:76-82 (cross-field branch lacks the `!fieldValue` guard that
    //         the standard-validator branch has at line 91).
    it('gtField on an empty optional field does not error (fixed)', () => {
        const data = [
            tf('min', 'Min'),
            tf('max', 'Max', {
                rules: { validation: [{ rule: 'gtField', field: 'min', message: 'max must exceed min' }] },
            }),
        ];
        const { submit, errorsOf } = setup('cf-gt-empty', data); // both empty
        submit();
        expect(errorsOf().some((e: any) => e.id === 'max')).toBe(false);
    });
});

// =====================================================================
describe('DEEP: subforms', () => {
    const withSub = (matchValue: string) => [
        {
            type: 'textfield',
            props: { id: 'choice', MuiAttributes: { label: 'Choice' } },
            layout: { row: 1, xs: 12 },
            subforms: [
                {
                    conditionValue: matchValue,
                    data: [tf('detail', 'Detail')],
                },
            ],
        },
    ];

    it('renders the subform when the field value matches (string)', () => {
        setup('sf-str', withSub('yes'), { choice: 'yes' });
        expect(screen.queryByLabelText('Detail')).not.toBeNull();
    });

    it('does not render the subform when the value does not match', () => {
        setup('sf-nomatch', withSub('yes'), { choice: 'no' });
        expect(screen.queryByLabelText('Detail')).toBeNull();
    });

    it('renders the subform when an ARRAY value includes the match (multi-select)', () => {
        setup('sf-arr', withSub('b'), { choice: ['a', 'b'] });
        expect(screen.queryByLabelText('Detail')).not.toBeNull();
    });

    it('bubbles a subform edit up to the parent store', () => {
        setup('sf-bubble', withSub('yes'), { choice: 'yes' });
        editText('Detail', 'hello');
        expect(FormData('sf-bubble').detail).toBe('hello');
    });

    it('bubbles a nested (2-level) subform edit up to the top parent store', () => {
        const nested = [
            {
                type: 'textfield',
                props: { id: 'l1', MuiAttributes: { label: 'L1' } },
                layout: { row: 1, xs: 12 },
                subforms: [
                    {
                        conditionValue: 'open',
                        data: [
                            {
                                type: 'textfield',
                                props: { id: 'l2', MuiAttributes: { label: 'L2' } },
                                layout: { row: 1, xs: 12 },
                                subforms: [
                                    { conditionValue: 'deep', data: [tf('leaf', 'Leaf')] },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        setup('sf-nested', nested, { l1: 'open', l2: 'deep' });
        expect(screen.queryByLabelText('Leaf')).not.toBeNull();
        editText('Leaf', 'buried');
        expect(FormData('sf-nested').leaf).toBe('buried');
    });
});

// =====================================================================
describe('DEEP: autoSave (browser storage)', () => {
    beforeEach(() => {
        window.localStorage.clear();
        window.sessionStorage.clear();
    });

    it('persists an edit to localStorage under the default key', () => {
        render(<FormGenerator guid="as-1" data={[tf('name', 'Name')]} autoSave />);
        editText('Name', 'Ada');
        const saved = JSON.parse(window.localStorage.getItem('dynamic-mui:as-1') || '{}');
        expect(saved.name).toBe('Ada');
    });

    it('restores a saved draft on remount', () => {
        window.localStorage.setItem('dynamic-mui:as-2', JSON.stringify({ name: 'Restored' }));
        render(<FormGenerator guid="as-2" data={[tf('name', 'Name')]} autoSave />);
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Restored');
        expect(FormData('as-2').name).toBe('Restored');
    });

    it('honors a custom autoSaveKey and sessionStorage', () => {
        render(
            <FormGenerator
                guid="as-3"
                data={[tf('name', 'Name')]}
                autoSave
                autoSaveStorage="session"
                autoSaveKey="my-key"
            />,
        );
        editText('Name', 'Grace');
        expect(window.sessionStorage.getItem('my-key')).toContain('Grace');
        expect(window.localStorage.getItem('my-key')).toBeNull();
    });

    it('round-trips an edit across unmount + remount', () => {
        const { unmount } = render(<FormGenerator guid="as-4" data={[tf('name', 'Name')]} autoSave />);
        editText('Name', 'Persisted');
        unmount();
        render(<FormGenerator guid="as-4" data={[tf('name', 'Name')]} autoSave />);
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Persisted');
    });
});

// =====================================================================
describe('DEEP: multiple FormGenerators', () => {
    it('different guids do not cross-contaminate', () => {
        // NOTE: distinct field ids (xa/xb) — a field id becomes the DOM element id, so two
        // forms sharing a field id would produce duplicate DOM ids and getByLabelText would
        // resolve to the wrong input. That is a label-association gotcha, not store leakage.
        render(
            <>
                <FormGenerator guid="mf-a" data={[tf('xa', 'X A')]} />
                <FormGenerator guid="mf-b" data={[tf('xb', 'X B')]} />
            </>,
        );
        editText('X A', 'aaa');
        editText('X B', 'bbb');
        expect(FormData('mf-a').xa).toBe('aaa');
        expect(FormData('mf-b').xb).toBe('bbb');
    });

    it('same guid shares one store (documented footgun)', () => {
        render(
            <>
                <FormGenerator guid="mf-shared" data={[tf('x', 'First X')]} />
                <FormGenerator guid="mf-shared" data={[tf('y', 'Second Y')]} />
            </>,
        );
        editText('First X', '111');
        editText('Second Y', '222');
        // Both writes land in the SAME response['mf-shared'].
        expect(FormData('mf-shared').x).toBe('111');
        expect(FormData('mf-shared').y).toBe('222');
    });
});

// =====================================================================
describe('DEEP: persistOnUnmount', () => {
    it('clears the store on unmount by default', () => {
        const { unmount } = render(<FormGenerator guid="pu-1" data={[tf('name', 'Name')]} patch={{ name: 'x' }} />);
        expect(FormData('pu-1')).toBeTruthy();
        unmount();
        expect(FormData('pu-1')).toBeUndefined();
    });

    it('keeps the store on unmount when persistOnUnmount is set', () => {
        const { unmount } = render(
            <FormGenerator guid="pu-2" data={[tf('name', 'Name')]} patch={{ name: 'keep' }} persistOnUnmount />,
        );
        unmount();
        expect(FormData('pu-2')).toBeTruthy();
        expect(FormData('pu-2').name).toBe('keep');
    });
});

// =====================================================================
describe('DEEP: apiRef', () => {
    it('setValues merges + getValues reflects + validate flips', () => {
        const ref = React.createRef<FormApi>();
        render(
            <FormGenerator
                guid="api-deep-1"
                data={[tf('name', 'Name', { rules: { validation: [{ rule: 'mandatory', message: 'req' }] } })]}
                apiRef={ref}
            />,
        );
        expect(ref.current!.validate()).toBe(false);
        ref.current!.setValues({ name: 'Ada' });
        expect(ref.current!.getValues().name).toBe('Ada');
        expect(ref.current!.validate()).toBe(true);
    });

    it('submit() runs the full flow and reports errors', () => {
        const onSubmit = vi.fn();
        const ref = React.createRef<FormApi>();
        render(
            <FormGenerator
                guid="api-deep-2"
                data={[tf('email', 'Email', { rules: { validation: [{ rule: 'mandatory', message: 'req' }] } })]}
                apiRef={ref}
                onSubmit={onSubmit}
            />,
        );
        ref.current!.submit();
        expect(onSubmit).toHaveBeenCalled();
        expect(onSubmit.mock.calls[0][1].some((e: any) => e.id === 'email')).toBe(true);
    });

    it('reset() clears the live store immediately, even for a field with a schema default', () => {
        const ref = React.createRef<FormApi>();
        render(<FormGenerator guid="api-deep-3" data={[tfv('name', 'Name', 'John')]} apiRef={ref} />);
        ref.current!.setValues({ name: 'Edited' });
        expect(ref.current!.getValues().name).toBe('Edited');
        ref.current!.reset();
        // reset() deletes response[guid]; getValues reads the raw store directly, so it is
        // empty right after reset (any re-seed would only happen on a subsequent render pass).
        expect(ref.current!.getValues().name).toBeUndefined();
    });

    it('reset() clears a field that had no schema default', () => {
        const ref = React.createRef<FormApi>();
        render(<FormGenerator guid="api-deep-4" data={[tf('name', 'Name')]} apiRef={ref} />);
        ref.current!.setValues({ name: 'temp' });
        ref.current!.reset();
        expect(ref.current!.getValues().name).toBeUndefined();
    });
});

// =====================================================================
describe('DEEP: submitTick error display + validationSummary', () => {
    it('surfaces an untouched mandatory error after submit', () => {
        render(
            <FormGenerator
                guid="tick-1"
                data={[tf('name', 'Name', { rules: { validation: [{ rule: 'mandatory', message: 'Name required' }] } })]}
                onSubmit={vi.fn()}
            />,
        );
        expect(screen.queryByText('Name required')).toBeNull();
        fireEvent.click(screen.getByLabelText('button'));
        expect(screen.getByText('Name required')).toBeInTheDocument();
    });

    it('shows a visible summary only after a failed submit', () => {
        render(
            <FormGenerator
                guid="tick-2"
                data={[tf('name', 'Name', { rules: { validation: [{ rule: 'mandatory', message: 'req' }] } })]}
                validationSummary
            />,
        );
        expect(screen.queryByRole('alert')).toBeNull();
        fireEvent.click(screen.getByLabelText('button'));
        expect(screen.getByRole('alert')).toHaveTextContent(/1 field/i);
    });
});
