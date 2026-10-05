import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AIForm from './AIForm';
import { ClearFormData } from '../../components/FormGenerator';

const schema = [
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Full Name' } }, layout: { row: 1, xs: 12 } },
    { type: 'select', props: { id: 'role', MuiAttributes: { label: 'Role' }, options: [{ value: 'admin', label: 'Admin' }] }, layout: { row: 2, xs: 12 } },
] as any;

afterEach(() => ClearFormData());

describe('AIForm', () => {
    it('renders the form from schema plus the AI toolbar', () => {
        const client = {} as any;
        render(<AIForm client={client} data={schema} guid="aiform-1" />);
        expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /ai fill/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /review/i })).toBeInTheDocument();
    });

    it('hides the Generate button unless enabled', () => {
        const client = {} as any;
        const { rerender } = render(<AIForm client={client} data={schema} guid="aiform-2" />);
        expect(screen.queryByRole('button', { name: /generate|edit with ai/i })).toBeNull();
        rerender(<AIForm client={client} data={schema} guid="aiform-2" enableGenerate />);
        expect(screen.getByRole('button', { name: /edit with ai/i })).toBeInTheDocument();
    });

    it('opens the AI Fill dialog and, on extract, feeds values into the form', async () => {
        const client = { extractToFields: vi.fn().mockResolvedValue({ name: 'Ada Lovelace' }) } as any;
        render(<AIForm client={client} data={schema} guid="aiform-3" />);

        fireEvent.click(screen.getByRole('button', { name: /ai fill/i }));
        const paste = await screen.findByLabelText(/paste text to autofill/i);
        fireEvent.change(paste, { target: { value: 'Her name is Ada Lovelace' } });
        fireEvent.click(screen.getByRole('button', { name: /autofill from text/i }));

        // extractToFields is called with descriptors derived from the schema (incl. options for the select)
        await waitFor(() => expect(client.extractToFields).toHaveBeenCalled());
        const [, fieldsArg] = client.extractToFields.mock.calls[0];
        expect(fieldsArg.find((f: any) => f.id === 'role').options).toEqual(['admin']);
        // the extracted value hydrates the Name input
        await waitFor(() => expect((screen.getByLabelText('Full Name') as HTMLInputElement).value).toBe('Ada Lovelace'));
    });
});
