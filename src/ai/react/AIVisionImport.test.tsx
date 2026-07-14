import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIVisionImport from './AIVisionImport';

const makeFile = () => new File(['x'], 'form.png', { type: 'image/png' });

const pickFile = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });
};

describe('AIVisionImport', () => {
    it('renders the file picker and action button', () => {
        const client = { generateFormFromImage: vi.fn() } as any;
        render(<AIVisionImport client={client} onGenerate={vi.fn()} />);
        expect(screen.getByText(/choose image/i)).toBeInTheDocument();
        expect(screen.getByText(/build form from image/i)).toBeInTheDocument();
    });

    it('generate mode: reads the file and calls generateFormFromImage → onGenerate', async () => {
        const fields = [{ type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } }];
        const client = { generateFormFromImage: vi.fn().mockResolvedValue(fields) } as any;
        const onGenerate = vi.fn();
        render(<AIVisionImport client={client} onGenerate={onGenerate} />);

        pickFile();
        await waitFor(() => expect(screen.getByText('form.png')).toBeInTheDocument());
        fireEvent.click(screen.getByText(/build form from image/i));

        await waitFor(() => expect(client.generateFormFromImage).toHaveBeenCalled());
        const [imgArg] = client.generateFormFromImage.mock.calls[0];
        expect(String(imgArg)).toMatch(/^data:/);
        await waitFor(() => expect(onGenerate).toHaveBeenCalledWith(fields));
    });

    it('fill mode: derives fields from schema and calls extractFromImage → onFill', async () => {
        const client = { extractFromImage: vi.fn().mockResolvedValue({ name: 'Ada' }) } as any;
        const onFill = vi.fn();
        const schema = [{ type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } }] as any;
        render(<AIVisionImport client={client} mode="fill" schema={schema} onFill={onFill} />);

        pickFile();
        await waitFor(() => expect(screen.getByText('form.png')).toBeInTheDocument());
        fireEvent.click(screen.getByText(/read document into form/i));

        await waitFor(() => expect(client.extractFromImage).toHaveBeenCalled());
        const [, fieldsArg] = client.extractFromImage.mock.calls[0];
        expect(fieldsArg).toEqual([{ id: 'name', label: 'Name', type: 'textfield' }]);
        await waitFor(() => expect(onFill).toHaveBeenCalledWith({ name: 'Ada' }));
    });

    it('disables the action button until a file is chosen', () => {
        const client = { generateFormFromImage: vi.fn() } as any;
        render(<AIVisionImport client={client} onGenerate={vi.fn()} />);
        expect(screen.getByText(/build form from image/i).closest('button')).toBeDisabled();
    });
});
