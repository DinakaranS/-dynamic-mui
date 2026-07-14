import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileUpload from './fileupload';
import { ControlProps } from '../../../types';

describe('FileUpload Control', () => {
    const baseProps: ControlProps = {
        attributes: { id: 'doc', label: 'Upload Document' },
        rules: {},
        onChange: vi.fn(),
    };

    it('renders the dropzone with label and helper text', () => {
        render(<FileUpload {...baseProps} />);
        expect(screen.getByText('Upload Document')).toBeInTheDocument();
        expect(screen.getByText(/Drag & drop/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Upload Document' })).toBeInTheDocument();
    });

    it('fires onChange when a file is selected via the input', async () => {
        const onChange = vi.fn();
        const { container } = render(<FileUpload {...baseProps} onChange={onChange} />);
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        const input = container.querySelector('input[type=file]') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => expect(onChange).toHaveBeenCalled());
        expect(onChange.mock.calls[0][0]).toMatchObject({ id: 'doc' });
    });

    it('renders an existing value as a preview with a remove button', () => {
        const onChange = vi.fn();
        render(
            <FileUpload
                attributes={{ id: 'doc', label: 'Files', multiple: true, value: ['report.pdf'] }}
                rules={{}}
                onChange={onChange}
            />,
        );
        expect(screen.getByText('report.pdf')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'remove' }));
        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'doc', value: [] }));
    });

    it('shows a required asterisk when mandatory', () => {
        render(
            <FileUpload
                attributes={{ id: 'doc', label: 'Upload' }}
                rules={{ validation: [{ rule: 'mandatory', message: 'Required' }] }}
                onChange={vi.fn()}
            />,
        );
        expect(screen.getByText('*')).toBeInTheDocument();
    });
});
