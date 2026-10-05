import { FormField } from '../util/helper';

export type DemoVariant = { label: string; field: FormField };

const tf = (label: string, extra: any = {}, props: any = {}): FormField => ({
    type: 'textfield', props: { id: 't', MuiAttributes: { label, ...extra }, ...props }, layout: { xs: 12 },
});

/**
 * Curated config variants per component so the Demo gallery shows "what this
 * component can do". Any component NOT listed here falls back to its single
 * playground template (see DemoCard).
 */
export const DEMO_VARIANTS: Record<string, DemoVariant[]> = {
    textfield: [
        { label: 'Basic', field: tf('Full name') },
        { label: 'Placeholder + helper', field: tf('Email', { placeholder: 'you@example.com', helperText: 'We never share it.' }) },
        { label: 'Required', field: { ...tf('Required field'), rules: { validation: [{ rule: 'mandatory', message: 'This field is required' }] } } },
        { label: '$ prefix adornment', field: tf('Amount', {}, { InputProps: { text: '$', position: 'start' } }) },
        { label: 'Multiline', field: tf('Notes', { multiline: true, minRows: 3 }) },
    ],
    numberfield: [
        { label: 'Basic', field: { type: 'numberfield', props: { id: 'n', MuiAttributes: { label: 'Quantity' } }, layout: { xs: 12 } } },
        { label: 'Thousands format', field: { type: 'numberfield', props: { id: 'n', value: 1234567, MuiAttributes: { label: 'Population' } }, layout: { xs: 12 } } },
    ],
    numberstepper: [
        { label: 'Default (0–99)', field: { type: 'numberstepper', props: { id: 's', label: 'Quantity', min: 0, max: 99, value: 1 }, layout: { xs: 12 } } },
        { label: 'Step 5', field: { type: 'numberstepper', props: { id: 's', label: 'People', min: 0, max: 50, step: 5, value: 10 }, layout: { xs: 12 } } },
    ],
    password: [
        { label: 'Basic', field: { type: 'password', props: { id: 'p', MuiAttributes: { label: 'Password' } }, layout: { xs: 12 } } },
        { label: 'With strength meter', field: { type: 'password', props: { id: 'p', showStrength: true, MuiAttributes: { label: 'New password' } }, layout: { xs: 12 } } },
    ],
    currency: [
        { label: 'USD', field: { type: 'currency', props: { id: 'c', prefix: '$', MuiAttributes: { label: 'Price (USD)' } }, layout: { xs: 12 } } },
        { label: 'EUR', field: { type: 'currency', props: { id: 'c', prefix: '€ ', MuiAttributes: { label: 'Price (EUR)' } }, layout: { xs: 12 } } },
    ],
    intlphone: [
        { label: 'Default US', field: { type: 'intlphone', props: { id: 'ph', label: 'Phone', defaultCountry: 'US' }, layout: { xs: 12 } } },
        { label: 'Default India', field: { type: 'intlphone', props: { id: 'ph', label: 'Phone', defaultCountry: 'IN' }, layout: { xs: 12 } } },
    ],
    select: [
        { label: 'Single', field: { type: 'select', props: { id: 'sel', options: [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }], MuiBoxAttributes: { label: 'Fruit' } }, layout: { xs: 12 } } },
        { label: 'Multiple', field: { type: 'select', props: { id: 'sel', MuiAttributes: { multiple: true }, options: [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }, { value: 'c', label: 'Cherry' }], MuiBoxAttributes: { label: 'Fruits' } }, layout: { xs: 12 } } },
        { label: 'Preselected', field: { type: 'select', props: { id: 'sel', value: 'b', options: [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }], MuiBoxAttributes: { label: 'Fruit' } }, layout: { xs: 12 } } },
    ],
    chipselect: [
        { label: 'Single', field: { type: 'chipselect', props: { id: 'ch', label: 'Plan', options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Team' }] }, layout: { xs: 12 } } },
        { label: 'Multi + icons', field: { type: 'chipselect', props: { id: 'ch', label: 'Interests', multiple: true, options: [{ value: 'design', label: 'Design', icon: 'palette' }, { value: 'dev', label: 'Dev', icon: 'code' }, { value: 'sales', label: 'Sales', icon: 'trending_up' }] }, layout: { xs: 12 } } },
    ],
    togglebuttons: [
        { label: 'Single (exclusive)', field: { type: 'togglebuttons', props: { id: 'tb', label: 'Align', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }] }, layout: { xs: 12 } } },
        { label: 'Multiple', field: { type: 'togglebuttons', props: { id: 'tb', label: 'Format', multiple: true, options: [{ value: 'b', label: 'Bold' }, { value: 'i', label: 'Italic' }, { value: 'u', label: 'Underline' }] }, layout: { xs: 12 } } },
    ],
    radio: [
        { label: 'Vertical', field: { type: 'radio', props: { id: 'r', MuiFLabel: 'Size', MuiFCLabels: ['Small', 'Medium', 'Large'] }, layout: { xs: 12 } } },
        { label: 'label/value options', field: { type: 'radio', props: { id: 'r', MuiFLabel: 'Plan', MuiFCLabels: [{ label: 'Monthly', value: 'm' }, { label: 'Yearly', value: 'y' }] }, layout: { xs: 12 } } },
    ],
    checkbox: [
        { label: 'Unchecked', field: { type: 'checkbox', props: { id: 'cb', MuiFCLAttributes: { label: 'Subscribe' } }, layout: { xs: 12 } } },
        { label: 'Checked default', field: { type: 'checkbox', props: { id: 'cb', value: true, MuiFCLAttributes: { label: 'I agree' } }, layout: { xs: 12 } } },
    ],
    switch: [
        { label: 'Off', field: { type: 'switch', props: { id: 'sw', MuiFCLAttributes: { label: 'Notifications' } }, layout: { xs: 12 } } },
        { label: 'On default', field: { type: 'switch', props: { id: 'sw', value: true, MuiFCLAttributes: { label: 'Dark mode' } }, layout: { xs: 12 } } },
    ],
    slider: [
        { label: 'Single', field: { type: 'slider', props: { id: 'sl', label: 'Volume', min: 0, max: 100, value: 40 }, layout: { xs: 12 } } },
        { label: 'Range', field: { type: 'slider', props: { id: 'sl', label: 'Price range', min: 0, max: 1000, value: [200, 700] }, layout: { xs: 12 } } },
        { label: 'With marks + step', field: { type: 'slider', props: { id: 'sl', label: 'Rating', min: 0, max: 10, step: 2, marks: true, value: 6 }, layout: { xs: 12 } } },
    ],
    rating: [
        { label: 'Default (5)', field: { type: 'rating', props: { id: 'ra', label: 'Rate us', value: 3 }, layout: { xs: 12 } } },
        { label: 'Half precision', field: { type: 'rating', props: { id: 'ra', label: 'Score', value: 3.5, MuiAttributes: { precision: 0.5 } }, layout: { xs: 12 } } },
    ],
    nps: [
        { label: '0–10 (NPS)', field: { type: 'nps', props: { id: 'nps', label: 'How likely to recommend?', min: 0, max: 10 }, layout: { xs: 12 } } },
        { label: '1–5', field: { type: 'nps', props: { id: 'nps', label: 'Satisfaction', min: 1, max: 5, lowLabel: 'Bad', highLabel: 'Great' }, layout: { xs: 12 } } },
    ],
    alert: [
        { label: 'Info', field: { type: 'alert', props: { severity: 'info', title: 'Heads up', text: 'This is an info message.' }, layout: { xs: 12 } } },
        { label: 'Success', field: { type: 'alert', props: { severity: 'success', text: 'Saved successfully.' }, layout: { xs: 12 } } },
        { label: 'Warning', field: { type: 'alert', props: { severity: 'warning', text: 'Double-check your input.' }, layout: { xs: 12 } } },
        { label: 'Error (filled)', field: { type: 'alert', props: { severity: 'error', variant: 'filled', text: 'Something went wrong.' }, layout: { xs: 12 } } },
    ],
    button: [
        { label: 'Contained', field: { type: 'button', props: { text: 'Submit', MuiAttributes: { variant: 'contained' } }, layout: { xs: 12 } } },
        { label: 'Outlined', field: { type: 'button', props: { text: 'Cancel', MuiAttributes: { variant: 'outlined', color: 'secondary' } }, layout: { xs: 12 } } },
        { label: 'With icon', field: { type: 'button', props: { text: 'Download', icon: 'download', MuiAttributes: { variant: 'contained', color: 'success' } }, layout: { xs: 12 } } },
    ],
    chip: [
        { label: 'Default', field: { type: 'chip', props: { label: 'Default' }, layout: { xs: 12 } } },
        { label: 'Colored', field: { type: 'chip', props: { label: 'Primary', MuiAttributes: { color: 'primary' } }, layout: { xs: 12 } } },
        { label: 'Outlined', field: { type: 'chip', props: { label: 'Outlined', MuiAttributes: { variant: 'outlined', color: 'success' } }, layout: { xs: 12 } } },
    ],
    typography: [
        { label: 'Heading', field: { type: 'typography', props: { text: 'Section heading', MuiAttributes: { variant: 'h5' } }, layout: { xs: 12 } } },
        { label: 'Body', field: { type: 'typography', props: { text: 'Some descriptive body text for the form.', MuiAttributes: { variant: 'body2', color: 'text.secondary' } }, layout: { xs: 12 } } },
    ],
    datetime: [
        { label: 'Date', field: { type: 'datetime', props: { id: 'd', MuiAttributes: { label: 'Date', fullWidth: true } }, layout: { xs: 12 } } },
    ],
    tagsinput: [
        { label: 'Empty', field: { type: 'tagsinput', props: { id: 'tg', label: 'Tags', options: ['react', 'mui', 'node'] }, layout: { xs: 12 } } },
        { label: 'Prefilled', field: { type: 'tagsinput', props: { id: 'tg', label: 'Skills', value: ['TypeScript', 'React'] }, layout: { xs: 12 } } },
    ],
    computed: [
        { label: 'Total = qty × price', field: { type: 'computed', props: { id: 'total', formula: 'qty * price', prefix: '$ ', MuiAttributes: { label: 'Total (qty=3, price=9.99)' }, value: 29.97 }, layout: { xs: 12 } } },
    ],
};
