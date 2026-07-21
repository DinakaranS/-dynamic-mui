import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

const schema = [
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, rules: { validation: [{ rule: 'mandatory', message: 'Required' }] }, layout: { row: 1, xs: 12 } },
];

describe('FormGenerator submit bar', () => {
    it('renders no visible submit button by default', () => {
        render(<FormGenerator guid="sb-0" data={schema as any} />);
        expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    });

    it('renders a visible submit button with submitLabel and runs the submit flow', () => {
        const onSubmit = vi.fn();
        render(<FormGenerator guid="sb-1" data={schema as any} submitLabel="Save" onSubmit={onSubmit} />);
        const btn = screen.getByRole('button', { name: 'Save' });
        fireEvent.click(btn);
        // Submit ran and reported the mandatory error.
        expect(onSubmit).toHaveBeenCalled();
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'name')).toBe(true);
    });

    it('renders a cancel button that calls onCancel', () => {
        const onCancel = vi.fn();
        render(<FormGenerator guid="sb-2" data={schema as any} submitLabel="Save" cancelLabel="Cancel" onCancel={onCancel} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(onCancel).toHaveBeenCalled();
    });

    it('hides the submit bar in readOnly mode', () => {
        render(<FormGenerator guid="sb-3" data={schema as any} submitLabel="Save" readOnly />);
        expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    });

    it('applies the submitButton config: label, color, and an icon', () => {
        render(<FormGenerator guid="sb-4" data={schema as any} submitButton={{ label: 'Send report', color: 'success', icon: 'send' }} />);
        const btn = screen.getByRole('button', { name: /Send report/ });
        expect(btn).toBeInTheDocument();
        // MUI applies the palette colour class for a named colour.
        expect(btn.className).toMatch(/colorSuccess/);
        // The leading icon is rendered.
        expect(btn.querySelector('.MuiButton-startIcon')).not.toBeNull();
    });

    it('shows a loader and disables the button while an async onSubmit is pending', async () => {
        let resolveSubmit: () => void = () => {};
        const onSubmit = vi.fn(() => new Promise<void>((res) => { resolveSubmit = res; }));
        render(<FormGenerator guid="sb-5" data={[{ type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } }] as any} submitButton={{ label: 'Save', loadingLabel: 'Saving…' }} onSubmit={onSubmit} />);

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        // While the promise is pending the button shows the loading label + spinner and is disabled.
        await waitFor(() => expect(screen.getByRole('button', { name: /Saving…/ })).toBeDisabled());
        expect(screen.getByRole('button', { name: /Saving…/ }).querySelector('.MuiCircularProgress-root')).not.toBeNull();

        resolveSubmit();
        await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled());
    });
});
