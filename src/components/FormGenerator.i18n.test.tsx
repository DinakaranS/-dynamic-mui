import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { FormGenerator, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

// A dictionary-backed translate, exactly like an app's `t(key) = dict[key] ?? key`.
const dict: Record<string, string> = {
    Welcome: 'Bienvenido',
    'Full name': 'Nombre completo',
    'I agree': 'Acepto',
    Free: 'Gratis',
    Pro: 'Profesional',
    Save: 'Guardar',
    Required: 'Obligatorio',
    Country: 'País',
    'United States': 'Estados Unidos',
};
const translate = (s: string) => dict[s] ?? s;

const schema = [
    { type: 'typography', props: { text: 'Welcome' }, layout: { row: 0, xs: 12 } },
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Full name' } }, rules: { validation: [{ rule: 'mandatory', message: 'Required' }] }, layout: { row: 1, xs: 12 } },
    { type: 'checkbox', props: { id: 'agree', MuiFCLAttributes: { label: 'I agree' } }, layout: { row: 2, xs: 12 } },
    { type: 'radio', props: { id: 'plan', MuiFCLabels: [{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }] }, layout: { row: 3, xs: 12 } },
    { type: 'select', props: { id: 'country', options: [{ value: 'us', label: 'United States' }], MuiBoxAttributes: { label: 'Country' } }, layout: { row: 4, xs: 12 } },
];

describe('FormGenerator translate (i18n extensibility)', () => {
    it('translates labels, typography, option labels, and the submit button', () => {
        render(<FormGenerator guid="i18n-1" data={schema as any} translate={translate} submitButton={{ label: 'Save' }} />);
        expect(screen.getByText('Bienvenido')).toBeInTheDocument();           // typography
        expect(screen.getByLabelText(/Nombre completo/)).toBeInTheDocument(); // textfield label (required → asterisk)
        expect(screen.getByText('Acepto')).toBeInTheDocument();               // checkbox label
        expect(screen.getByText('Gratis')).toBeInTheDocument();               // radio option
        expect(screen.getByText('Profesional')).toBeInTheDocument();
        expect(screen.getByLabelText('País')).toBeInTheDocument();            // select label
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument(); // submit
    });

    it('translates validation messages', () => {
        const onSubmit = vi.fn();
        render(<FormGenerator guid="i18n-2" data={schema as any} translate={translate} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByLabelText('button')); // submit → name is required
        const errors = onSubmit.mock.calls[0][1];
        const nameErr = errors.find((e: any) => e.id === 'name');
        expect(nameErr?.message).toBe('Obligatorio');
    });

    it('is a no-op when no translate is provided (labels unchanged)', () => {
        render(<FormGenerator guid="i18n-3" data={schema as any} />);
        expect(screen.getByLabelText(/Full name/)).toBeInTheDocument();
        expect(screen.getByText('Welcome')).toBeInTheDocument();
    });
});
