import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from './FormGenerator';
import { registerControl, unregisterControl } from '../util/registry';
import { ControlProps } from '../types';

afterEach(() => { ClearFormData(); unregisterControl('rating-stars'); unregisterControl('textfield'); });

// A minimal custom control: receives ControlProps, reads attributes.value,
// emits onChange({ id, value }).
const StarRating = ({ attributes = {}, onChange }: ControlProps) => {
    const value = Number(attributes.value ?? 0);
    return (
        <div aria-label={attributes.MuiAttributes?.label}>
            {[1, 2, 3].map((n) => (
                <button key={n} type="button" aria-label={`star-${n}`} onClick={() => onChange?.({ id: attributes.id || '', value: n })}>
                    {n <= value ? '★' : '☆'}
                </button>
            ))}
        </div>
    );
};

// A custom control that overrides the built-in `textfield`.
const Marker = ({ attributes = {} }: ControlProps) => <div data-testid="custom-tf">{attributes.id}</div>;

describe('custom control registration', () => {
    it('renders a registered custom control and captures its value', () => {
        registerControl('rating-stars', StarRating);
        const schema = [
            { type: 'rating-stars', props: { id: 'score', MuiAttributes: { label: 'Score' } }, layout: { row: 1, xs: 12 } },
        ];
        render(<FormGenerator guid="reg-1" data={schema as any} />);

        // The custom control rendered.
        expect(screen.getByLabelText('Score')).toBeInTheDocument();
        // Interacting with it flows into the form store.
        fireEvent.click(screen.getByLabelText('star-2'));
        expect(FormData('reg-1').score).toBe(2);
    });

    it('a registered type overrides the built-in control of the same type', () => {
        registerControl('textfield', Marker);
        const schema = [
            { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } },
        ];
        render(<FormGenerator guid="reg-2" data={schema as any} />);
        // The override renders instead of the built-in MUI TextField.
        expect(screen.getByTestId('custom-tf')).toHaveTextContent('name');
        expect(screen.queryByLabelText('Name')).toBeNull();
    });

    it('unknown types (no registration, no built-in) render nothing harmful', () => {
        const schema = [{ type: 'totally-unknown', props: { id: 'x' }, layout: { row: 1, xs: 12 } }];
        expect(() => render(<FormGenerator guid="reg-3" data={schema as any} />)).not.toThrow();
    });
});
