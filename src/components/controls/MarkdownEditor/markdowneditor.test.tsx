import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownEditor from './markdowneditor';
import { ControlProps } from '../../../types';

describe('MarkdownEditor Control', () => {
    const mockOnChange = vi.fn();
    const baseProps: ControlProps = {
        attributes: {
            id: 'test-md',
            value: '',
            label: 'Notes',
            MuiAttributes: {},
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders the textarea with the label', () => {
        render(<MarkdownEditor {...baseProps} />);
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    });

    it('fires onChange with the typed text', () => {
        mockOnChange.mockClear();
        render(<MarkdownEditor {...baseProps} />);
        const textarea = screen.getByLabelText('Notes');
        fireEvent.change(textarea, { target: { value: 'hello world' } });
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-md', value: 'hello world' }),
        );
    });

    it('renders converted HTML in preview mode', () => {
        const props: ControlProps = {
            ...baseProps,
            attributes: { ...baseProps.attributes, value: '**bold**' },
        };
        render(<MarkdownEditor {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
        const preview = screen.getByTestId('markdown-preview');
        expect(preview.innerHTML).toContain('<strong>');
        expect(screen.getByText('bold').tagName).toBe('STRONG');
    });

    it('escapes HTML so a script tag is not rendered as a real element', () => {
        const props: ControlProps = {
            ...baseProps,
            attributes: { ...baseProps.attributes, value: '<script>alert(1)</script>' },
        };
        render(<MarkdownEditor {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Preview' }));
        const preview = screen.getByTestId('markdown-preview');
        expect(preview.querySelector('script')).toBeNull();
        expect(preview.innerHTML).toContain('&lt;script&gt;');
    });
});
