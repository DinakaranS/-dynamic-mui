import { FormField } from '../util/helper';

export const TEMPLATES: Record<string, FormField[]> = {
    'textfield': [
        {
            type: 'textfield',
            props: { MuiAttributes: { placeholder: 'Standard', fullWidth: true, variant: 'standard' } },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'button': [
        {
            type: 'button',
            props: {
                text: 'Submit',
                MuiAttributes: { variant: 'contained', color: 'primary' }
            },
            layout: { row: 1, xs: 3, sm: 3 }
        }
    ],
    'checkbox': [
        {
            type: 'checkbox',
            props: {
                id: 'defaultChecked',
                MuiAttributes: { defaultChecked: true },
                MuiFCLAttributes: { label: 'Checkbox' },
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'select': [
        {
            type: 'select',
            props: {
                id: 'simpleselect',
                MuiAttributes: {},
                options: [
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                ],
                MuiBoxAttributes: { label: 'Select' },
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'datetime': [
        {
            type: 'datetime',
            props: {
                id: 'datetime',
                MuiAttributes: {
                    placeholder: 'Date Time',
                    variant: 'standard',
                    fullWidth: true,
                    sx: { width: '100%' },
                },
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'radio': [
        {
            id: 'radio-sample',
            type: 'radio',
            props: {
                id: 'radio-sample',
                value: 'option1',
                MuiAttributes: {},
                MuiFLabel: 'Radio Group',
                MuiFCLAttributes: {},
                MuiFCLabels: ['Option 1', 'Option 2'],
                MuiRGAttributes: { row: true },
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'switch': [
        {
            type: 'switch',
            props: {
                id: 'switchdefault',
                value: true,
                MuiAttributes: {},
                MuiFCLAttributes: { label: 'Switch' },
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'typography': [
        {
            type: 'typography',
            props: {
                text: 'Sample Heading',
                MuiAttributes: { variant: 'h6' }
            },
            layout: { row: 1, xs: 12, sm: 12 }
        }
    ],
    'datatable': [
        {
            type: 'datatable',
            props: {
                id: 'datatable',
                MuiAttributes: {
                    rows: [
                        { id: 1, col1: 'Hello', col2: 'World' },
                        { id: 2, col1: 'DataGrid', col2: 'is Awesome' },
                    ],
                    columns: [
                        { field: 'col1', headerName: 'Column 1', width: 150 },
                        { field: 'col2', headerName: 'Column 2', width: 150 },
                    ],
                },
                container: { style: { height: 300, width: '100%' } }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'divider': [
        {
            type: 'divider',
            props: {
                MuiAttributes: { sx: { my: 2 } }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'chip': [
        {
            type: 'chip',
            props: {
                label: 'New Chip',
                MuiAttributes: { color: 'primary', variant: 'filled' }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'list': [
        {
            type: 'list',
            props: {
                items: [
                    { primary: 'Item 1', secondary: 'Secondary text', icon: 'star' },
                    { primary: 'Item 2', icon: 'inbox' }
                ],
                MuiAttributes: { dense: true }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'numberfield': [
        {
            type: 'numberfield',
            props: {
                id: 'number-sample',
                MuiAttributes: {
                    label: 'Number Input',
                    variant: 'outlined'
                }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'multitextbox': [
        {
            type: 'multitextbox',
            props: {
                id: 'dynamic-list',
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'signature': [
        {
            type: 'signature',
            props: {
                id: 'user-signature',
                MuiAttributes: { sx: { mb: 2 } }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'chart-bar': [
        {
            type: 'chart-bar',
            props: {
                MuiAttributes: {
                    xAxis: [{ scaleType: 'band', data: ['A', 'B', 'C'] }],
                    series: [{ data: [4, 3, 5] }],
                    width: 500,
                    height: 300
                }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'chart-line': [
        {
            type: 'chart-line',
            props: {
                MuiAttributes: {
                    xAxis: [{ data: [1, 2, 3, 5, 8, 10] }],
                    series: [{ data: [2, 5.5, 2, 8.5, 1.5, 5] }],
                    width: 500,
                    height: 300
                }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'timepicker': [
        {
            type: 'timepicker',
            props: {
                id: 'timepicker',
                MuiAttributes: {
                    className: 'form-control',
                    placeholder: 'Time Picker',
                    variant: 'standard',
                    fullWidth: true,
                    sx: { width: '100%' },
                },
            },
            layout: { row: 1, xs: 12, sm: 12 },
        }
    ],
    'chart-pie': [
        {
            type: 'chart-pie',
            props: {
                MuiAttributes: {
                    series: [
                        {
                            data: [
                                { id: 0, value: 10, label: 'Series A' },
                                { id: 1, value: 15, label: 'Series B' },
                                { id: 2, value: 20, label: 'Series C' },
                            ],
                        },
                    ],
                    width: 400,
                    height: 200,
                }
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'group': [
        {
            type: 'group',
            props: {
                label: 'Field Group',
                subFields: [
                    {
                        type: 'textfield',
                        props: { MuiAttributes: { label: 'Nested Field' } },
                        layout: { xs: 12 }
                    }
                ]
            },
            layout: { xs: 12 }
        }
    ],
    'accordion': [
        {
            type: 'accordion',
            props: {
                label: 'Accordion Section',
                subFields: [
                    {
                        type: 'typography',
                        props: { text: 'Hidden content' },
                        layout: { xs: 12 }
                    }
                ]
            },
            layout: { xs: 12 }
        }
    ],
    'tabs': [
        {
            type: 'tabs',
            props: {
                tabs: [
                    { label: 'Tab 1', subFields: [{ type: 'textfield', props: { MuiAttributes: { label: 'Tab 1 Field' } }, layout: { xs: 12 } }] },
                    { label: 'Tab 2', subFields: [] }
                ]
            },
            layout: { xs: 12 }
        }
    ],
    'autocomplete': [
        {
            type: 'autocomplete',
            props: {
                id: 'auto-1',
                label: 'Choose Movie',
                options: ['The Godfather', 'Pulp Fiction', 'The Dark Knight'],
                MuiAttributes: {}
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'imagelist': [
        {
            type: 'imagelist',
            props: {
                items: [
                    { img: 'https://images.unsplash.com/photo-1551963831-b3b1ca40c98e', title: 'Breakfast' },
                    { img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d', title: 'Burger' }
                ],
                MuiAttributes: {}
            },
            layout: { xs: 12 }
        }
    ],
    'hyperlink': [
        {
            type: 'hyperlink',
            props: {
                id: 'hyperlink-1',
                label: 'Hyperlink',
                displayText: 'Click Here',
                url: 'https://example.com',
                MuiAttributes: {}
            },
            layout: { xs: 12 }
        }
    ]
};

export const TOOLBOX_ITEMS = [
    { type: 'textfield', label: 'Text Field', icon: 'text_fields' },
    { type: 'select', label: 'Select', icon: 'list' },
    { type: 'checkbox', label: 'Checkbox', icon: 'check_box' },
    { type: 'switch', label: 'Switch', icon: 'toggle_on' },
    { type: 'radio', label: 'Radio', icon: 'radio_button_checked' },
    { type: 'datetime', label: 'Date Time', icon: 'calendar_today' },
    { type: 'timepicker', label: 'Time Picker', icon: 'access_time' },
    { type: 'numberfield', label: 'Number Field', icon: 'onetwothree' }, // Custom or generic icon
    { type: 'multitextbox', label: 'Multi Textbox', icon: 'playlist_add' },
    { type: 'signature', label: 'Signature', icon: 'draw' },
    { type: 'button', label: 'Button', icon: 'smart_button' },
    { type: 'typography', label: 'Typography', icon: 'text_format' },
    { type: 'datatable', label: 'Data Table', icon: 'table_chart' },
    { type: 'divider', label: 'Divider', icon: 'horizontal_rule' },
    { type: 'chip', label: 'Chip', icon: 'label' },
    { type: 'list', label: 'List', icon: 'format_list_bulleted' },
    // { type: 'stepper', label: 'Stepper', icon: 'linear_scale' }, // Complex to mock
    { type: 'chart-bar', label: 'Bar Chart', icon: 'bar_chart' },
    { type: 'chart-line', label: 'Line Chart', icon: 'show_chart' },
    { type: 'chart-pie', label: 'Pie Chart', icon: 'pie_chart' },
    { type: 'group', label: 'Group', icon: 'crop_square' },
    { type: 'accordion', label: 'Accordion', icon: 'expand_more' },
    { type: 'tabs', label: 'Tabs', icon: 'tab' },
    { type: 'autocomplete', label: 'Auto Complete', icon: 'arrow_drop_down_circle' },
    { type: 'imagelist', label: 'Image List', icon: 'collections' },
    { type: 'hyperlink', label: 'Hyperlink', icon: 'link' },
];
