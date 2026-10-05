import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, ClearFormData } from './FormGenerator';
import { zodResolver } from '../util/resolvers';

afterEach(() => ClearFormData());

// Duck-typed zod-like object schema.
const fakeSchema = {
    safeParse: (v: Record<string, any>) => {
        const issues: any[] = [];
        if (!v.email || !String(v.email).includes('@')) issues.push({ path: ['email'], message: 'Invalid email', code: 'bad_email' });
        if (v.showExtra && !v.extra) issues.push({ path: ['extra'], message: 'Extra required', code: 'required' });
        return issues.length ? { success: false, error: { issues } } : { success: true };
    },
};

const schema = [
    { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } },
    { type: 'switch', props: { id: 'showExtra', MuiFCLAttributes: { label: 'Show extra' } }, layout: { row: 2, xs: 12 } },
    { type: 'textfield', props: { id: 'extra', MuiAttributes: { label: 'Extra' } }, visibleWhen: { field: 'showExtra', op: 'eq', value: true }, layout: { row: 3, xs: 12 } },
];

describe('FormGenerator resolver (Zod/Yup) integration', () => {
    it('surfaces schema errors in the onSubmit errors array', () => {
        const onSubmit = vi.fn();
        render(<FormGenerator guid="res-1" data={schema as any} resolver={zodResolver(fakeSchema)} patch={{ email: 'bad' }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'email' && e.rule === 'bad_email')).toBe(true);
    });

    it('passes when the schema is satisfied', () => {
        const onSubmit = vi.fn();
        render(<FormGenerator guid="res-2" data={schema as any} resolver={zodResolver(fakeSchema)} patch={{ email: 'a@b.com' }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.length).toBe(0);
    });

    it('does NOT report a schema error for a field hidden by visibleWhen', () => {
        const onSubmit = vi.fn();
        // showExtra=false → `extra` is hidden, so its schema error must be skipped.
        render(<FormGenerator guid="res-3" data={schema as any} resolver={zodResolver(fakeSchema)} patch={{ email: 'a@b.com', showExtra: false }} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'extra')).toBe(false);
    });
});
