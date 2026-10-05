import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TagsInput from './tagsinput';
import { ControlProps } from '../../../types';

describe('TagsInput Control', () => {
    const baseProps: ControlProps = {
        attributes: {
            id: 'tags',
            value: ['red', 'blue'],
            options: ['green', 'yellow'],
            label: 'Colors',
            placeholder: 'Add a color',
        },
        rules: {},
        onChange: vi.fn(),
    };

    it('renders initial tags as chips', () => {
        render(<TagsInput {...baseProps} />);
        expect(screen.getByText('red')).toBeInTheDocument();
        expect(screen.getByText('blue')).toBeInTheDocument();
    });

    it('renders the label', () => {
        render(<TagsInput {...baseProps} />);
        expect(screen.getByLabelText(/Colors/i)).toBeInTheDocument();
    });

    it('adds a tag on Enter and fires onChange with the new tag', () => {
        const onChange = vi.fn();
        render(<TagsInput {...baseProps} onChange={onChange} />);
        const input = screen.getByRole('combobox');

        fireEvent.change(input, { target: { value: 'green' } });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onChange).toHaveBeenCalled();
        const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(lastCall.id).toBe('tags');
        expect(lastCall.value).toContain('green');
        expect(lastCall.value).toEqual(expect.arrayContaining(['red', 'blue', 'green']));
    });

    it('hydrates a separator-joined string value into tags', () => {
        render(
            <TagsInput
                {...baseProps}
                attributes={{ ...baseProps.attributes, value: 'one;two;three', separator: ';' }}
            />,
        );
        expect(screen.getByText('one')).toBeInTheDocument();
        expect(screen.getByText('two')).toBeInTheDocument();
        expect(screen.getByText('three')).toBeInTheDocument();
    });
});
