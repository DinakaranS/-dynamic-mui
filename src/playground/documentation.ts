export const COMPONENT_DOCS: Record<string, { title: string; description: string; usage: string; props: Record<string, string> }> = {
    textfield: {
        title: 'Text Field',
        description: 'A basic input field for text data.',
        usage: 'Use for names, addresses, or short text inputs.',
        props: {
            label: 'The label text displayed above or inside the input',
            placeholder: 'Ghost text shown when empty',
            helperText: 'Supportive text shown below the input',
            required: 'Whether the field is mandatory'
        }
    },
    select: {
        title: 'Select Dropdown',
        description: 'A dropdown menu to select one option from a list.',
        usage: 'Use when you have 5-15 mutually exclusive options.',
        props: {
            label: 'Label for the dropdown',
            options: 'Array of { value, label } objects',
            fullWidth: 'Whether it takes full width of container'
        }
    },
    checkbox: {
        title: 'Checkbox',
        description: 'A binary selection control.',
        usage: 'Use for boolean choices like "I agree" or binary settings.',
        props: {
            label: 'Text displayed next to the checkbox',
            defaultChecked: 'Initial state'
        }
    },
    switch: {
        title: 'Switch',
        description: 'A toggle switch for on/off states.',
        usage: 'Use for settings or instant-effect toggles.',
        props: {
            label: 'Label text',
            color: 'Color theme of the switch'
        }
    },
    radio: {
        title: 'Radio Group',
        description: 'A set of mutually exclusive options.',
        usage: 'Use when users need to see all options at once (unlike select).',
        props: {
            options: 'List of radio options',
            row: 'Display horizontally if true'
        }
    },
    datetime: {
        title: 'Date Time Picker',
        description: 'A comprehensive date and time selector.',
        usage: 'Use for scheduling or timestamp inputs.',
        props: {
            disablePast: 'Prevent selecting past dates',
            format: 'Date format string'
        }
    },
    button: {
        title: 'Button',
        description: 'A clickable action element.',
        usage: 'Use for form submission, resets, or navigation.',
        props: {
            text: 'Button label',
            variant: 'contained | outlined | text',
            color: 'primary | secondary | error'
        }
    },
    typography: {
        title: 'Typography',
        description: 'Static text for headings and labels.',
        usage: 'Use for section headers, instructions, or disclaimers.',
        props: {
            text: 'Content to display',
            variant: 'h1...h6 | body1 | body2'
        }
    },
    lineitemlist: {
        title: 'Line Item List',
        description: 'A dynamic list of rows — each row has a description field and a fee/amount field. Rows can be added or removed. The key prefix for each row is derived automatically from the patched data, or set via the keyPrefix prop.',
        usage: 'Use for itemised charges, miscellaneous entries, or any repeatable description+amount pairs.',
        props: {
            id: 'Unique field identifier',
            keyPrefix: 'Prefix for generated row keys, e.g. "charge" → charge1, charge2 (auto-detected from patch data)',
            showRowBadge: 'Show/hide the row-number circle badge. Default: true',
            'MuiAttributes.row': 'MUI Box props spread onto each row container',
            'MuiAttributes.rowBadge': 'MUI Typography props spread onto the row-number badge',
            'MuiAttributes.description': 'MUI TextField props spread onto the description input',
            'MuiAttributes.fee': 'MUI TextField props spread onto the fee input',
            'MuiAttributes.addButton': 'MUI Button props spread onto the Add (+) button',
            'MuiAttributes.removeButton': 'MUI IconButton props spread onto the Remove button'
        }
    },
    formrepeater: {
        title: 'Form Repeater',
        description: 'A number input that dynamically generates N copies of a form group. Each group renders any sub-fields defined in subFields. Output is an array of objects, one per group.',
        usage: 'Use for repeating data entry — team members, line items, addresses, beneficiaries, etc.',
        props: {
            id: 'Unique field identifier',
            label: 'Label prefix for each group heading (e.g. "Member" → Member 1, Member 2)',
            count: 'Initial number of groups to render',
            min: 'Minimum number of groups allowed (default: 1)',
            max: 'Maximum number of groups allowed (optional)',
            subFields: 'Array of FormField definitions rendered inside each group',
            value: 'Array of patch objects, one per group, to pre-fill values'
        }
    }
};
