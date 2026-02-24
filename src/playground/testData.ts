import { FormField } from '../util/helper';

export const ALL_CONTROLS_TEST_DATA: FormField[] = [
    {
        type: 'typography',
        props: { text: 'All Controls Test', MuiAttributes: { variant: 'h4', gutterBottom: true } },
        layout: { xs: 12 }
    },
    {
        type: 'typography',
        props: { text: 'Basic Inputs', MuiAttributes: { variant: 'h6' } },
        layout: { xs: 12 }
    },
    {
        type: 'textfield',
        props: { id: 'text1', MuiAttributes: { label: 'Text Field', fullWidth: true } },
        layout: { xs: 12, sm: 6 }
    },
    {
        type: 'numberfield',
        props: { id: 'num1', MuiAttributes: { label: 'Number Field', fullWidth: true } },
        layout: { xs: 12, sm: 6 }
    },
    {
        type: 'checkbox',
        props: { id: 'check1', MuiFCLAttributes: { label: 'Checkbox' } },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'hyperlink',
        props: {
            id: 'link1',
            label: 'External Link',
            displayText: 'Open Google',
            url: 'https://google.com'
        },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'switch',
        props: { id: 'switch1', MuiFCLAttributes: { label: 'Toggle Subform' } },
        layout: { xs: 12, sm: 4 },
        subforms: [
            {
                conditionValue: true,
                data: [
                    {
                        type: 'typography',
                        props: { text: 'Subform Active!', MuiAttributes: { color: 'success.main', variant: 'subtitle2' } },
                        layout: { xs: 12 }
                    },
                    {
                        type: 'textfield',
                        props: { id: 'subform_text', MuiAttributes: { label: 'Hidden Field', fullWidth: true } },
                        layout: { xs: 12 }
                    }
                ]
            }
        ]
    },
    {
        type: 'radio',
        props: {
            id: 'radio1',
            MuiFLabel: 'Radio Group',
            MuiFCLabels: ['Option A', 'Option B'],
            MuiRGAttributes: { row: true }
        },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'select',
        props: {
            id: 'select1',
            MuiBoxAttributes: { label: 'Select' },
            options: [{ value: '1', label: 'One' }, { value: '2', label: 'Two' }]
        },
        layout: { xs: 12, sm: 6 }
    },
    {
        type: 'autocomplete',
        props: {
            id: 'auto1',
            label: 'Autocomplete',
            options: ['Apple', 'Banana', 'Cherry']
        },
        layout: { xs: 12, sm: 6 }
    },
    {
        type: 'divider',
        props: { MuiAttributes: { sx: { my: 2 } } },
        layout: { xs: 12 }
    },
    {
        type: 'typography',
        props: { text: 'Date & Time', MuiAttributes: { variant: 'h6' } },
        layout: { xs: 12 }
    },
    {
        type: 'datetime',
        props: { id: 'date1', MuiAttributes: { label: 'Date Time' } },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'timepicker',
        props: { id: 'time1', MuiAttributes: { label: 'Time Picker' } },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'datetimepicker',
        props: { id: 'datetime1', MuiAttributes: { label: 'Date Time Picker' } },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'divider',
        props: { MuiAttributes: { sx: { my: 2 } } },
        layout: { xs: 12 }
    },
    {
        type: 'typography',
        props: { text: 'Complex Controls', MuiAttributes: { variant: 'h6' } },
        layout: { xs: 12 }
    },
    {
        type: 'chip',
        props: { label: 'Static Chip', MuiAttributes: { color: 'primary' } },
        layout: { xs: 12, sm: 3 }
    },
    {
        type: 'list',
        props: {
            items: [
                { primary: 'List Item 1', icon: 'star' },
                { primary: 'List Item 2', icon: 'check' }
            ]
        },
        layout: { xs: 12, sm: 4 }
    },
    {
        type: 'multitextbox',
        props: { id: 'multi1' },
        layout: { xs: 12, sm: 5 }
    },
    {
        type: 'signature',
        props: { id: 'sig1' },
        layout: { xs: 12 }
    },
    {
        type: 'imagelist',
        props: {
            items: [
                { img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e', title: 'Breakfast' },
                { img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d', title: 'Burger' }
            ],
            cols: 2
        },
        layout: { xs: 12 }
    },
    {
        type: 'datatable',
        props: {
            id: 'table1',
            MuiAttributes: {
                rows: [{ id: 1, col1: 'A' }, { id: 2, col1: 'B' }],
                columns: [{ field: 'col1', headerName: 'Column 1', width: 150 }]
            },
            container: { style: { height: 300, width: '100%' } }
        },
        layout: { xs: 12 }
    },
    {
        type: 'divider',
        props: { MuiAttributes: { sx: { my: 2 } } },
        layout: { xs: 12 }
    },
    {
        type: 'typography',
        props: { text: 'Containers', MuiAttributes: { variant: 'h6' } },
        layout: { xs: 12 }
    },
    {
        type: 'group',
        props: {
            label: 'Group Container',
            subFields: [
                { type: 'textfield', props: { id: 'group_text', MuiAttributes: { label: 'Grouped Field' } }, layout: { xs: 12 } }
            ]
        },
        layout: { xs: 12 }
    },
    {
        type: 'accordion',
        props: {
            label: 'Accordion Container',
            subFields: [
                { type: 'textfield', props: { id: 'acc_text', MuiAttributes: { label: 'Accordion Field' } }, layout: { xs: 12 } }
            ]
        },
        layout: { xs: 12 }
    },
    {
        type: 'tabs',
        props: {
            tabs: [
                { label: 'Tab A', subFields: [{ type: 'textfield', props: { MuiAttributes: { label: 'Tab A Field' } }, layout: { xs: 12 } }] },
                { label: 'Tab B', subFields: [{ type: 'typography', props: { text: 'Tab B Content' }, layout: { xs: 12 } }] }
            ]
        },
        layout: { xs: 12 }
    }
];
