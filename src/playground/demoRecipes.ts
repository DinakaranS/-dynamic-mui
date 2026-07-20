import { FormField } from '../util/helper';

export interface DemoRecipe {
    id: string;
    title: string;
    description: string;
    icon: string;
    data: FormField[];
}

/**
 * Practical, multi-field examples that show the DYNAMIC engine at work —
 * live formulas, conditional visibility, dependent selects (subforms),
 * required-when, disabled-when, and cross-field validation. These are the
 * real-world patterns single-component demos can't show.
 */
export const DEMO_RECIPES: DemoRecipe[] = [
    {
        id: 'formula',
        title: 'Live formula (order total)',
        description: 'Type a quantity and unit price — the Total recomputes instantly via a formula field (`qty * price`).',
        icon: 'functions',
        data: [
            { type: 'numberfield', props: { id: 'qty', value: 2, MuiAttributes: { label: 'Quantity' } }, layout: { row: 1, xs: 6 } },
            { type: 'numberfield', props: { id: 'price', value: 9.99, MuiAttributes: { label: 'Unit price' } }, layout: { row: 1, xs: 6 } },
            { type: 'computed', props: { id: 'total', prefix: '$ ', format: '0,0.00', MuiAttributes: { label: 'Total' } }, formula: 'qty * price', layout: { row: 2, xs: 12 } },
        ],
    },
    {
        id: 'formula-tax',
        title: 'Formula with tax (grand total)',
        description: 'Subtotal, a tax %, and a Grand total computed from both (`(qty*price) + (qty*price)*(tax/100)`).',
        icon: 'calculate',
        data: [
            { type: 'numberfield', props: { id: 'qty', value: 3, MuiAttributes: { label: 'Qty' } }, layout: { row: 1, xs: 4 } },
            { type: 'numberfield', props: { id: 'price', value: 20, MuiAttributes: { label: 'Price' } }, layout: { row: 1, xs: 4 } },
            { type: 'numberfield', props: { id: 'tax', value: 8, MuiAttributes: { label: 'Tax %' } }, layout: { row: 1, xs: 4 } },
            { type: 'computed', props: { id: 'subtotal', prefix: '$ ', format: '0,0.00', MuiAttributes: { label: 'Subtotal' } }, formula: 'qty * price', layout: { row: 2, xs: 6 } },
            { type: 'computed', props: { id: 'grand', prefix: '$ ', format: '0,0.00', MuiAttributes: { label: 'Grand total' } }, formula: '(qty * price) + (qty * price) * (tax / 100)', layout: { row: 2, xs: 6 } },
        ],
    },
    {
        id: 'conditional',
        title: 'Conditional field (visibleWhen)',
        description: 'Pick a status — the follow-up field appears only when relevant. Switch between Employed and Student.',
        icon: 'visibility',
        data: [
            { type: 'radio', props: { id: 'employment', MuiFLabel: 'Employment status', MuiFCLabels: [{ label: 'Employed', value: 'employed' }, { label: 'Student', value: 'student' }] }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'company', MuiAttributes: { label: 'Company name' } }, visibleWhen: { field: 'employment', op: 'eq', value: 'employed' }, layout: { row: 2, xs: 12 } },
            { type: 'textfield', props: { id: 'school', MuiAttributes: { label: 'School name' } }, visibleWhen: { field: 'employment', op: 'eq', value: 'student' }, layout: { row: 3, xs: 12 } },
        ],
    },
    {
        id: 'dependent-select',
        title: 'Dependent select (country → state)',
        description: 'ONE State select whose options change with Country — via `dependsOn` + `optionsMap`. No duplicated fields; switching country swaps the options and clears a now-invalid choice.',
        icon: 'account_tree',
        data: [
            { type: 'select', props: { id: 'country', options: [{ value: 'us', label: 'United States' }, { value: 'in', label: 'India' }], MuiBoxAttributes: { label: 'Country' } }, layout: { row: 1, xs: 12 } },
            {
                type: 'select',
                props: { id: 'state', MuiBoxAttributes: { label: 'State' } },
                dependsOn: 'country',
                optionsMap: {
                    us: [{ value: 'ca', label: 'California' }, { value: 'ny', label: 'New York' }, { value: 'tx', label: 'Texas' }],
                    in: [{ value: 'ka', label: 'Karnataka' }, { value: 'mh', label: 'Maharashtra' }, { value: 'tn', label: 'Tamil Nadu' }],
                },
                layout: { row: 2, xs: 12 },
            },
        ],
    },
    {
        id: 'required-when',
        title: 'Conditional required (requiredWhen)',
        description: 'Choosing a contact method makes only that field mandatory. Pick Email, then click Validate.',
        icon: 'rule',
        data: [
            { type: 'select', props: { id: 'contact', options: [{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'none', label: 'None' }], MuiBoxAttributes: { label: 'Preferred contact' } }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, requiredWhen: { field: 'contact', op: 'eq', value: 'email' }, requiredMessage: 'Email is required', layout: { row: 2, xs: 12 } },
            { type: 'textfield', props: { id: 'phoneNum', MuiAttributes: { label: 'Phone' } }, requiredWhen: { field: 'contact', op: 'eq', value: 'phone' }, requiredMessage: 'Phone is required', layout: { row: 3, xs: 12 } },
        ],
    },
    {
        id: 'disabled-when',
        title: 'Enable / disable (disabledWhen)',
        description: 'Toggle "same as billing" off to enable the shipping address field.',
        icon: 'toggle_on',
        data: [
            { type: 'switch', props: { id: 'sameAsBilling', value: true, MuiFCLAttributes: { label: 'Shipping same as billing' } }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'shipAddress', MuiAttributes: { label: 'Shipping address' } }, disabledWhen: { field: 'sameAsBilling', op: 'eq', value: true }, layout: { row: 2, xs: 12 } },
        ],
    },
    {
        id: 'cross-field',
        title: 'Cross-field validation (confirm password)',
        description: 'The confirm field must equal the password (`equalsField`). Enter mismatching values and click Validate.',
        icon: 'verified_user',
        data: [
            { type: 'password', props: { id: 'pwd', MuiAttributes: { label: 'Password' } }, rules: { validation: [{ rule: 'mandatory', message: 'Required' }] }, layout: { row: 1, xs: 12 } },
            { type: 'password', props: { id: 'confirm', MuiAttributes: { label: 'Confirm password' } }, rules: { validation: [{ rule: 'equalsField', field: 'pwd', message: 'Passwords must match' }] }, layout: { row: 2, xs: 12 } },
        ],
    },
    {
        id: 'cascade-3',
        title: 'Multi-level cascade (country → state → city)',
        description: 'Chained dynamic options — State options depend on Country, City options depend on State. Changing an upper level clears the ones below it.',
        icon: 'lan',
        data: [
            { type: 'select', props: { id: 'country', options: [{ value: 'us', label: 'United States' }, { value: 'in', label: 'India' }], MuiBoxAttributes: { label: 'Country' } }, layout: { row: 1, xs: 12 } },
            { type: 'select', props: { id: 'state', MuiBoxAttributes: { label: 'State' } }, dependsOn: 'country', optionsMap: { us: [{ value: 'ca', label: 'California' }, { value: 'ny', label: 'New York' }], in: [{ value: 'ka', label: 'Karnataka' }, { value: 'mh', label: 'Maharashtra' }] }, layout: { row: 2, xs: 12 } },
            { type: 'select', props: { id: 'city', MuiBoxAttributes: { label: 'City' } }, dependsOn: 'state', optionsMap: { ca: [{ value: 'la', label: 'Los Angeles' }, { value: 'sf', label: 'San Francisco' }], ny: [{ value: 'nyc', label: 'New York City' }, { value: 'buf', label: 'Buffalo' }], ka: [{ value: 'blr', label: 'Bengaluru' }, { value: 'mys', label: 'Mysuru' }], mh: [{ value: 'mum', label: 'Mumbai' }, { value: 'pun', label: 'Pune' }] }, layout: { row: 3, xs: 12 } },
        ],
    },
    {
        id: 'feedback-gate',
        title: 'Feedback gate (low rating → reason)',
        description: 'Rate the experience — if it is 3 stars or fewer, a "What went wrong?" field appears (visibleWhen with the `lte` operator).',
        icon: 'reviews',
        data: [
            { type: 'rating', props: { id: 'score', label: 'How was your experience?' }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'reason', MuiAttributes: { label: 'What went wrong?', multiline: true, minRows: 2 } }, visibleWhen: { field: 'score', op: 'lte', value: 3 }, layout: { row: 2, xs: 12 } },
        ],
    },
    {
        id: 'order-pricing',
        title: 'Pricing (discount + tax)',
        description: 'Quantity, price, discount % and tax % drive a live Subtotal and Total — several formula fields chained together.',
        icon: 'receipt_long',
        data: [
            { type: 'numberfield', props: { id: 'qty', value: 2, MuiAttributes: { label: 'Qty' } }, layout: { row: 1, xs: 6 } },
            { type: 'numberfield', props: { id: 'price', value: 50, MuiAttributes: { label: 'Unit price' } }, layout: { row: 1, xs: 6 } },
            { type: 'numberfield', props: { id: 'discount', value: 10, MuiAttributes: { label: 'Discount %' } }, layout: { row: 2, xs: 6 } },
            { type: 'numberfield', props: { id: 'tax', value: 8, MuiAttributes: { label: 'Tax %' } }, layout: { row: 2, xs: 6 } },
            { type: 'computed', props: { id: 'subtotal', prefix: '$ ', format: '0,0.00', MuiAttributes: { label: 'Subtotal' } }, formula: 'qty * price', layout: { row: 3, xs: 6 } },
            { type: 'computed', props: { id: 'total', prefix: '$ ', format: '0,0.00', MuiAttributes: { label: 'Total (after discount + tax)' } }, formula: '(qty * price - qty * price * discount / 100) + (qty * price - qty * price * discount / 100) * tax / 100', layout: { row: 3, xs: 6 } },
        ],
    },
    {
        id: 'range-validation',
        title: 'Range validation (max ≥ min)',
        description: 'Max budget must be greater-than-or-equal to Min budget (`gteField`). Set Max below Min and click Validate.',
        icon: 'compare_arrows',
        data: [
            { type: 'numberfield', props: { id: 'minBudget', value: 100, MuiAttributes: { label: 'Min budget' } }, layout: { row: 1, xs: 6 } },
            { type: 'numberfield', props: { id: 'maxBudget', value: 50, MuiAttributes: { label: 'Max budget' } }, rules: { validation: [{ rule: 'gteField', field: 'minBudget', message: 'Max must be ≥ Min' }] }, layout: { row: 1, xs: 6 } },
        ],
    },
    {
        id: 'other-specify',
        title: '"Other" → specify (visible + required)',
        description: 'Choosing "Other" reveals a field that is ALSO required (visibleWhen + requiredWhen together). Pick Other, then Validate.',
        icon: 'more_horiz',
        data: [
            { type: 'select', props: { id: 'source', options: [{ value: 'search', label: 'Search' }, { value: 'friend', label: 'Friend' }, { value: 'other', label: 'Other' }], MuiBoxAttributes: { label: 'How did you hear about us?' } }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'sourceOther', MuiAttributes: { label: 'Please specify' } }, visibleWhen: { field: 'source', op: 'eq', value: 'other' }, requiredWhen: { field: 'source', op: 'eq', value: 'other' }, requiredMessage: 'Please specify', layout: { row: 2, xs: 12 } },
        ],
    },
    {
        id: 'age-gate',
        title: 'Age-gated field (visibleWhen ≥)',
        description: 'Enter an age — the adult-consent checkbox appears only when age is 18 or older (`gte` operator).',
        icon: 'cake',
        data: [
            { type: 'numberfield', props: { id: 'age', value: 16, MuiAttributes: { label: 'Age' } }, layout: { row: 1, xs: 12 } },
            { type: 'checkbox', props: { id: 'consent', MuiFCLAttributes: { label: 'I confirm I am an adult and agree to the terms' } }, visibleWhen: { field: 'age', op: 'gte', value: 18 }, layout: { row: 2, xs: 12 } },
        ],
    },
    {
        id: 'shipping-toggle',
        title: 'Section toggle (switch reveals a group)',
        description: 'Turn on "Add shipping address" to reveal a whole set of address fields at once (multiple fields sharing one visibleWhen).',
        icon: 'local_shipping',
        data: [
            { type: 'switch', props: { id: 'addShipping', MuiFCLAttributes: { label: 'Add a separate shipping address' } }, layout: { row: 1, xs: 12 } },
            { type: 'textfield', props: { id: 'shipStreet', MuiAttributes: { label: 'Street' } }, visibleWhen: { field: 'addShipping', op: 'eq', value: true }, layout: { row: 2, xs: 12 } },
            { type: 'textfield', props: { id: 'shipCity', MuiAttributes: { label: 'City' } }, visibleWhen: { field: 'addShipping', op: 'eq', value: true }, layout: { row: 3, xs: 6 } },
            { type: 'textfield', props: { id: 'shipZip', MuiAttributes: { label: 'ZIP' } }, visibleWhen: { field: 'addShipping', op: 'eq', value: true }, layout: { row: 3, xs: 6 } },
        ],
    },
];
