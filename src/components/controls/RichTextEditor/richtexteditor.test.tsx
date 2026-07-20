import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RichTextEditor from './richtexteditor';
import { ControlProps } from '../../../types';

describe('RichTextEditor Control', () => {
    const mockOnChange = vi.fn();
    const baseProps: ControlProps = {
        attributes: {
            id: 'test-rte',
            value: '',
            label: 'Description',
            MuiAttributes: {},
        },
        onChange: mockOnChange,
        rules: {},
    };

    it('renders the label, the toolbar buttons and the editable region', () => {
        render(<RichTextEditor {...baseProps} />);
        expect(screen.getByText('Description')).toBeInTheDocument();
        // The editable region is exposed as a textbox with the label as aria-label.
        expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument();
        // Toolbar buttons render with accessible labels.
        expect(screen.getByLabelText('Bold')).toBeInTheDocument();
        expect(screen.getByLabelText('Italic')).toBeInTheDocument();
        expect(screen.getByLabelText('Underline')).toBeInTheDocument();
        expect(screen.getByLabelText('Bulleted list')).toBeInTheDocument();
        expect(screen.getByLabelText('Numbered list')).toBeInTheDocument();
        expect(screen.getByLabelText('Insert link')).toBeInTheDocument();
        expect(screen.getByLabelText('Clear formatting')).toBeInTheDocument();
    });

    it('falls back to a default aria-label when no label is provided', () => {
        render(<RichTextEditor {...baseProps} attributes={{ id: 'x', value: '' }} />);
        expect(screen.getByRole('textbox', { name: 'rich text' })).toBeInTheDocument();
    });

    it('clicking a toolbar button does not throw', () => {
        render(<RichTextEditor {...baseProps} />);
        expect(() => fireEvent.click(screen.getByLabelText('Bold'))).not.toThrow();
    });

    it('fires onChange with the innerHTML on input', () => {
        mockOnChange.mockClear();
        render(<RichTextEditor {...baseProps} />);
        const editable = screen.getByRole('textbox', { name: 'Description' });
        editable.innerHTML = '<b>hello</b>';
        fireEvent.input(editable);
        expect(mockOnChange).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'test-rte', value: '<b>hello</b>' })
        );
    });

    it('hydrates an initial value into the editable region', () => {
        render(
            <RichTextEditor
                {...baseProps}
                attributes={{ id: 'test-rte', value: '<p>Initial content</p>', label: 'Description' }}
            />
        );
        const editable = screen.getByRole('textbox', { name: 'Description' });
        expect(editable.innerHTML).toContain('Initial content');
    });
});
