import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AIFill } from './AIFill';
import type { FormField } from '../../types';

const makeClient = () =>
    ({
        extractToFields: vi.fn().mockResolvedValue({ name: 'Ada', email: 'ada@x.com' }),
    } as any);

describe('AIFill', () => {
    it('renders the paste box and the autofill button', () => {
        const client = makeClient();
        render(<AIFill client={client} fields={[{ id: 'name' }]} onFill={vi.fn()} />);

        expect(screen.getByLabelText('Paste text to autofill')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /autofill from text/i }),
        ).toBeInTheDocument();
    });

    it('extracts with the pasted text + explicit fields, then calls onFill with the result', async () => {
        const client = makeClient();
        const onFill = vi.fn();
        const fields = [{ id: 'name' }, { id: 'email' }];

        render(<AIFill client={client} fields={fields} onFill={onFill} />);

        const box = screen.getByLabelText('Paste text to autofill');
        fireEvent.change(box, { target: { value: 'Ada Lovelace, ada@x.com' } });
        fireEvent.click(screen.getByRole('button', { name: /autofill from text/i }));

        await waitFor(() => {
            expect(client.extractToFields).toHaveBeenCalledWith(
                'Ada Lovelace, ada@x.com',
                fields,
            );
        });
        await waitFor(() => {
            expect(onFill).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@x.com' });
        });
    });

    it('derives {id,label,type} from a schema prop', async () => {
        const client = makeClient();
        const onFill = vi.fn();
        const schema: FormField[] = [
            {
                type: 'textfield',
                props: { id: 'name', MuiAttributes: { label: 'Full Name' } },
            },
        ];

        render(<AIFill client={client} schema={schema} onFill={onFill} />);

        fireEvent.change(screen.getByLabelText('Paste text to autofill'), {
            target: { value: 'some text' },
        });
        fireEvent.click(screen.getByRole('button', { name: /autofill from text/i }));

        await waitFor(() => {
            expect(client.extractToFields).toHaveBeenCalledWith('some text', [
                { id: 'name', label: 'Full Name', type: 'textfield' },
            ]);
        });
    });

    it('still calls onFill when the client returns an empty object', async () => {
        const client = {
            extractToFields: vi.fn().mockResolvedValue({}),
        } as any;
        const onFill = vi.fn();

        render(<AIFill client={client} fields={[{ id: 'name' }]} onFill={onFill} />);
        fireEvent.click(screen.getByRole('button', { name: /autofill from text/i }));

        await waitFor(() => {
            expect(onFill).toHaveBeenCalledWith({});
        });
    });

    it('shows an error Alert when the client rejects', async () => {
        const client = {
            extractToFields: vi.fn().mockRejectedValue(new Error('boom')),
        } as any;

        render(<AIFill client={client} fields={[{ id: 'name' }]} onFill={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: /autofill from text/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('boom');
        });
    });
});
