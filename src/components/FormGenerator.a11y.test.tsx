import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, ClearFormData } from './FormGenerator';

expect.extend(toHaveNoViolations);
afterEach(() => ClearFormData());

const schema = [
    { type: 'typography', props: { text: 'Account details' }, layout: { row: 0, xs: 12 } },
    { type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Full name' } }, layout: { row: 1, xs: 12 } },
    { type: 'numberfield', props: { id: 'age', MuiAttributes: { label: 'Age' } }, layout: { row: 1, xs: 12 } },
    { type: 'select', props: { id: 'country', options: [{ value: 'us', label: 'United States' }, { value: 'in', label: 'India' }], MuiBoxAttributes: { label: 'Country' } }, layout: { row: 2, xs: 12 } },
    { type: 'checkbox', props: { id: 'agree', MuiFCLAttributes: { label: 'I agree to the terms' } }, layout: { row: 3, xs: 12 } },
    { type: 'radio', props: { id: 'plan', MuiFLabel: 'Plan', MuiFCLabels: [{ label: 'Free', value: 'free' }, { label: 'Pro', value: 'pro' }] }, layout: { row: 4, xs: 12 } },
    { type: 'switch', props: { id: 'notify', MuiFCLAttributes: { label: 'Email notifications' } }, layout: { row: 5, xs: 12 } },
    { type: 'password', props: { id: 'pw', MuiAttributes: { label: 'Password' } }, layout: { row: 6, xs: 12 } },
    { type: 'slider', props: { id: 'vol', MuiAttributes: { 'aria-label': 'Volume' } }, layout: { row: 7, xs: 12 } },
];

describe('accessibility (jest-axe)', () => {
    it('a form of core controls has no axe violations', async () => {
        const { container } = render(<FormGenerator guid="a11y-1" data={schema as any} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('renders cleanly and stays accessible under an RTL theme', async () => {
        const rtlTheme = createTheme({ direction: 'rtl' });
        const { container } = render(
            <div dir="rtl">
                <ThemeProvider theme={rtlTheme}>
                    <FormGenerator guid="a11y-rtl" data={schema as any} />
                </ThemeProvider>
            </div>,
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
