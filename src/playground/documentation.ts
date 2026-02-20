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
    }
};
