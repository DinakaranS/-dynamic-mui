import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, ClearFormData, FormApi } from './FormGenerator';

afterEach(() => ClearFormData());

const schema = [
    { type: 'typography', props: { text: 'Section header' }, layout: { row: 0, xs: 12 } },
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Full name' } }, layout: { row: 1, xs: 12 } },
    {
        type: 'select',
        props: { id: 'role', options: [{ value: 'dev', label: 'Developer' }, { value: 'design', label: 'Designer' }], MuiBoxAttributes: { label: 'Role' } },
        layout: { row: 2, xs: 12 },
    },
    { type: 'switch', props: { id: 'active', MuiFCLAttributes: { label: 'Active' } }, layout: { row: 3, xs: 12 } },
    { type: 'textfield', props: { id: 'secret', MuiAttributes: { label: 'Secret' } }, visibleWhen: { field: 'active', op: 'eq', value: true }, layout: { row: 4, xs: 12 } },
];

describe('FormGenerator review / read-only mode', () => {
    it('renders a value SUMMARY (labels + resolved values) instead of inputs', () => {
        render(<FormGenerator guid="rev-1" data={schema as any} reviewMode patch={{ name: 'Ada', role: 'dev', active: true, secret: 'x' }} />);
        // No editable input for name.
        expect(screen.queryByLabelText('Full name')).toBeNull();
        // Label + value rows are shown.
        expect(screen.getByText('Full name')).toBeInTheDocument();
        expect(screen.getByText('Ada')).toBeInTheDocument();
        // Select value resolves to the OPTION LABEL, not the raw value.
        expect(screen.getByText('Developer')).toBeInTheDocument();
        // Boolean → Yes.
        expect(screen.getByText('Yes')).toBeInTheDocument();
    });

    it('omits fields hidden by visibleWhen and display-only fields', () => {
        render(<FormGenerator guid="rev-2" data={schema as any} reviewMode patch={{ name: 'Ada', active: false, secret: 'hidden-value' }} />);
        // `secret` is hidden (active=false) → not in the summary.
        expect(screen.queryByText('hidden-value')).toBeNull();
        // Typography header carries no value → not listed as a row label.
        expect(screen.queryByText('Section header')).toBeNull();
    });

    it('preserves typed data across a review → edit round-trip (controls remount from the store)', () => {
        const { rerender } = render(<FormGenerator guid="rt-1" data={schema as any} />);
        const name = screen.getByLabelText('Full name') as HTMLInputElement;
        fireEvent.change(name, { target: { value: 'Grace' } });
        fireEvent.blur(name);
        expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('Grace');

        // Switch to review (inputs unmount) …
        rerender(<FormGenerator guid="rt-1" data={schema as any} reviewMode />);
        expect(screen.getByText('Grace')).toBeInTheDocument();

        // … then back to edit — the typed value must still be shown, not blank.
        rerender(<FormGenerator guid="rt-1" data={schema as any} />);
        expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('Grace');
    });

    it('readOnly disables the inputs but keeps the form layout', () => {
        render(<FormGenerator guid="ro-1" data={schema as any} readOnly patch={{ name: 'Ada' }} />);
        const input = screen.getByLabelText('Full name');
        expect(input).toBeDisabled();
    });

    it('exposes print() and exportPdf() on the imperative API', async () => {
        const api = createRef<FormApi>();
        render(<FormGenerator guid="pdf-1" data={schema as any} apiRef={api} patch={{ name: 'Ada', role: 'dev' }} />);
        expect(typeof api.current?.print).toBe('function');
        expect(typeof api.current?.exportPdf).toBe('function');
        // print() is dependency-free and must never throw (falls back gracefully).
        expect(() => api.current?.print({ title: 'Report' })).not.toThrow();
        // exportPdf() returns a Promise; its resolution depends on the optional
        // `pdfmake` package (and a real browser for rendering) — swallow either way.
        const p = api.current?.exportPdf({ title: 'Report' });
        expect(p).toBeInstanceOf(Promise);
        await p?.catch(() => { /* pdfmake may be absent or unsupported under jsdom */ });
    });
});
