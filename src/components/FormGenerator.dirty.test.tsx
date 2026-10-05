import { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData, FormApi } from './FormGenerator';

afterEach(() => ClearFormData());

const schema = [
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } },
];

describe('FormGenerator dirty-tracking', () => {
    it('starts pristine and becomes dirty after an edit', () => {
        const api = createRef<FormApi>();
        render(<FormGenerator guid="d-1" data={schema as any} apiRef={api} patch={{ name: 'Ada' }} />);
        expect(api.current?.isDirty()).toBe(false);
        expect(api.current?.getInitialValues()).toEqual({ name: 'Ada' });

        const input = screen.getByLabelText('Name');
        fireEvent.change(input, { target: { value: 'Grace' } });
        fireEvent.blur(input);
        expect(api.current?.isDirty()).toBe(true);
    });

    it('resetToInitial restores the starting values and clears dirty', () => {
        const api = createRef<FormApi>();
        render(<FormGenerator guid="d-2" data={schema as any} apiRef={api} patch={{ name: 'Ada' }} />);
        const input = screen.getByLabelText('Name');
        fireEvent.change(input, { target: { value: 'Grace' } });
        fireEvent.blur(input);
        expect(api.current?.isDirty()).toBe(true);

        api.current?.resetToInitial();
        expect(FormData('d-2').name).toBe('Ada');
        expect(api.current?.isDirty()).toBe(false);
    });

    it('resetToInitial visually clears a field that was empty initially (remounts controls)', () => {
        const api = createRef<FormApi>();
        const twoFields = [
            { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'notes', MuiAttributes: { label: 'Notes' } }, layout: { row: 2, xs: 12 } },
        ];
        render(<FormGenerator guid="d-reset" data={twoFields as any} apiRef={api} patch={{ name: 'Ada' }} />);

        const notes = screen.getByLabelText('Notes') as HTMLInputElement;
        fireEvent.change(notes, { target: { value: 'hello' } });
        fireEvent.blur(notes);
        expect(FormData('d-reset').notes).toBe('hello');

        act(() => api.current?.resetToInitial());

        // Store cleared for the once-empty field...
        expect(FormData('d-reset').notes).toBeUndefined();
        // ...AND the displayed input is actually empty now (the real bug).
        expect((screen.getByLabelText('Notes') as HTMLInputElement).value).toBe('');
        // The untouched initial value is preserved.
        expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Ada');
    });

    it('markPristine adopts current values as the new clean baseline', () => {
        const api = createRef<FormApi>();
        render(<FormGenerator guid="d-3" data={schema as any} apiRef={api} patch={{ name: 'Ada' }} />);
        const input = screen.getByLabelText('Name');
        fireEvent.change(input, { target: { value: 'Grace' } });
        fireEvent.blur(input);
        expect(api.current?.isDirty()).toBe(true);

        api.current?.markPristine(); // e.g. after a successful save
        expect(api.current?.isDirty()).toBe(false);
        expect(api.current?.getInitialValues()).toEqual({ name: 'Grace' });
    });
});
