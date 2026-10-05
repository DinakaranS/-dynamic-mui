import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

const schema = [
    { type: 'textfield', props: { id: 'username', MuiAttributes: { label: 'Username' } }, layout: { row: 1, xs: 12 } },
];

// "taken" is taken; anything else is available.
const checkUsername = vi.fn((value: string) => new Promise<string | null>((res) => {
    setTimeout(() => res(value === 'taken' ? 'Username is taken' : null), 5);
}));

describe('FormGenerator async (remote) validation', () => {
    it('shows an invalid message and blocks submit when the async check fails', async () => {
        const onSubmit = vi.fn();
        render(<FormGenerator guid="a-1" data={schema as any} asyncValidators={{ username: checkUsername }} onSubmit={onSubmit} />);

        const input = screen.getByLabelText('Username');
        fireEvent.change(input, { target: { value: 'taken' } });
        fireEvent.blur(input);

        // The invalid message appears after the debounce + async resolve.
        await waitFor(() => expect(screen.getByText('Username is taken')).toBeInTheDocument());

        // Submitting is blocked — the async error is in the errors list.
        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'username' && e.rule === 'async')).toBe(true);
    });

    it('shows an available indicator and does not block submit when valid', async () => {
        const onSubmit = vi.fn();
        render(<FormGenerator guid="a-2" data={schema as any} asyncValidators={{ username: checkUsername }} onSubmit={onSubmit} />);

        const input = screen.getByLabelText('Username');
        fireEvent.change(input, { target: { value: 'ada' } });
        fireEvent.blur(input);

        await waitFor(() => expect(screen.getByText('Available')).toBeInTheDocument());

        fireEvent.click(screen.getByLabelText('button'));
        const errors = onSubmit.mock.calls[0][1];
        expect(errors.some((e: any) => e.id === 'username')).toBe(false);
    });
});
