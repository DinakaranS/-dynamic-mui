import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIFormGenerator from './AIFormGenerator';

const sampleFields = [
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } },
];

describe('AIFormGenerator', () => {
    it('renders the prompt input and the generate button', () => {
        const client = { generateForm: vi.fn().mockResolvedValue(sampleFields) } as any;
        render(<AIFormGenerator client={client} onGenerate={vi.fn()} />);

        expect(screen.getByRole('textbox')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Generate form' })).toBeTruthy();
    });

    it('calls generateForm with the prompt and passes the result to onGenerate', async () => {
        const client = { generateForm: vi.fn().mockResolvedValue(sampleFields) } as any;
        const onGenerate = vi.fn();
        render(<AIFormGenerator client={client} onGenerate={onGenerate} />);

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'A contact form' } });
        fireEvent.click(screen.getByRole('button', { name: 'Generate form' }));

        await waitFor(() => {
            expect(client.generateForm).toHaveBeenCalledWith('A contact form');
            expect(onGenerate).toHaveBeenCalledWith(sampleFields);
        });
    });

    it('calls editForm(current, prompt) when current is provided', async () => {
        const editedFields = [
            { type: 'textfield', props: { id: 'phone', MuiAttributes: { label: 'Phone' } }, layout: { row: 2, xs: 12 } },
        ];
        const client = {
            generateForm: vi.fn(),
            editForm: vi.fn().mockResolvedValue(editedFields),
        } as any;
        const onGenerate = vi.fn();
        render(<AIFormGenerator client={client} current={sampleFields as any} onGenerate={onGenerate} />);

        expect(screen.getByRole('button', { name: 'Apply edit' })).toBeTruthy();

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Add a phone field' } });
        fireEvent.click(screen.getByRole('button', { name: 'Apply edit' }));

        await waitFor(() => {
            expect(client.editForm).toHaveBeenCalledWith(sampleFields, 'Add a phone field');
            expect(onGenerate).toHaveBeenCalledWith(editedFields);
            expect(client.generateForm).not.toHaveBeenCalled();
        });
    });

    it('shows an error Alert when the client rejects', async () => {
        const client = {
            generateForm: vi.fn().mockRejectedValue(new Error('proxy unavailable')),
        } as any;
        render(<AIFormGenerator client={client} onGenerate={vi.fn()} />);

        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Anything' } });
        fireEvent.click(screen.getByRole('button', { name: 'Generate form' }));

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toContain('proxy unavailable');
        });
    });
});
