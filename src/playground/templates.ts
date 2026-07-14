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
    'chipselect': [
        {
            type: 'chipselect',
            props: {
                id: 'chipselect',
                label: 'Choose your interests',
                multiple: true,
                options: [
                    { value: 'design', label: 'Design', icon: 'palette' },
                    { value: 'dev', label: 'Development', icon: 'code' },
                    { value: 'marketing', label: 'Marketing', icon: 'campaign' },
                    { value: 'sales', label: 'Sales', icon: 'trending_up' },
                ],
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'daterangepicker': [
        {
            type: 'daterangepicker',
            props: { id: 'daterange', startLabel: 'Start', endLabel: 'End', format: 'MM/DD/YYYY' },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'rating': [
        {
            type: 'rating',
            props: { id: 'rating', label: 'Rate your experience', MuiAttributes: { max: 5 } },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'slider': [
        {
            type: 'slider',
            props: { id: 'slider', label: 'Amount', min: 0, max: 100, step: 1, value: 40 },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'tagsinput': [
        {
            type: 'tagsinput',
            props: { id: 'tags', label: 'Tags', placeholder: 'Add a tag…', options: ['React', 'MUI', 'Node'], value: [] },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'togglebuttons': [
        {
            type: 'togglebuttons',
            props: {
                id: 'alignment',
                label: 'Alignment',
                options: [
                    { value: 'left', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'right', label: 'Right' },
                ],
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'password': [
        {
            type: 'password',
            props: { id: 'password', showStrength: true, MuiAttributes: { label: 'Password' } },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'otp': [
        {
            type: 'otp',
            props: { id: 'otp', label: 'Verification code', length: 6 },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'phone': [
        {
            type: 'phone',
            props: { id: 'phone', MuiAttributes: { label: 'Phone number' } },
            layout: { row: 1, xs: 12, sm: 6 },
        },
    ],
    'currency': [
        {
            type: 'currency',
            props: { id: 'amount', prefix: '$', MuiAttributes: { label: 'Amount' } },
            layout: { row: 1, xs: 12, sm: 6 },
        },
    ],
    'fileupload': [
        {
            type: 'fileupload',
            props: { id: 'files', label: 'Upload files', multiple: true, accept: 'image/*' },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'alert': [
        {
            type: 'alert',
            props: { severity: 'info', title: 'Heads up', text: 'This is an informational message.' },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'computed': [
        {
            type: 'computed',
            props: { id: 'total', formula: 'qty * price', prefix: '$ ', MuiAttributes: { label: 'Total' } },
            layout: { row: 1, xs: 12, sm: 6 },
        },
    ],
    'keyvalue': [
        {
            type: 'keyvalue',
            props: { id: 'metadata', keyLabel: 'Key', valueLabel: 'Value', value: {} },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'numberstepper': [
        {
            type: 'numberstepper',
            props: { id: 'quantity', label: 'Quantity', min: 0, max: 99, step: 1, value: 1 },
            layout: { row: 1, xs: 12, sm: 6 },
        },
    ],
    'matrix': [
        {
            type: 'matrix',
            props: {
                id: 'survey',
                label: 'How satisfied are you?',
                rows: [{ id: 'service', label: 'Service' }, { id: 'quality', label: 'Quality' }],
                columns: [{ value: '1', label: 'Poor' }, { value: '2', label: 'OK' }, { value: '3', label: 'Great' }],
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'consent': [
        {
            type: 'consent',
            props: {
                id: 'terms',
                text: 'These are the terms and conditions. Please read them fully before agreeing. '.repeat(8),
                label: 'I have read and agree to the terms',
                requireScroll: true,
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'colorpicker': [
        {
            type: 'colorpicker',
            props: { id: 'color', label: 'Brand colour', value: '#6366f1', presets: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'] },
            layout: { row: 1, xs: 12, sm: 6 },
        },
    ],
    'markdown': [
        {
            type: 'markdown',
            props: { id: 'bio', label: 'Bio', rows: 6 },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'address': [
        {
            type: 'address',
            props: { id: 'address' },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'cascadeselect': [
        {
            type: 'cascadeselect',
            props: {
                id: 'state',
                label: 'State / Province',
                parentValue: 'us',
                optionsMap: {
                    us: [{ value: 'ca', label: 'California' }, { value: 'ny', label: 'New York' }],
                    in: [{ value: 'ka', label: 'Karnataka' }, { value: 'tn', label: 'Tamil Nadu' }],
                },
            },
            layout: { row: 1, xs: 12, sm: 6 },
        },
    ],
    'formwizard': [
        {
            type: 'formwizard',
            props: {
                id: 'wizard',
                steps: [
                    { label: 'Account', fields: [{ type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } }] },
                    { label: 'Profile', fields: [{ type: 'textfield', props: { id: 'name', MuiAttributes: { label: 'Name' } }, layout: { row: 1, xs: 12 } }] },
                ],
            },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'geo': [
        {
            type: 'geo',
            props: { id: 'location', label: 'Location', value: { lat: '', lng: '' } },
            layout: { row: 1, xs: 12, sm: 12 },
        },
    ],
    'summary': [
        {
            type: 'summary',
            props: { id: 'summary', title: 'Review', guid: 'builder-preview' },
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
    'lineitemlist': [
        {
            type: 'lineitemlist',
            props: {
                id: 'line-item-list',
                value: [
                    { fee: 0, miscellaneous1: '' }
                ]
            },
            layout: { xs: 12, sm: 12 }
        }
    ],
    'formrepeater': [
        {
            type: 'formrepeater',
            props: {
                id: 'form-repeater',
                label: 'Group',
                count: 1,
                min: 1,
                subFields: [
                    {
                        type: 'textfield',
                        props: { id: 'field1', MuiAttributes: { label: 'Field 1', fullWidth: true } },
                        layout: { xs: 12 },
                        visible: true
                    }
                ]
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
    ],
    'locationfield': [
        {
            type: 'locationfield',
            props: {
                id: 'location-1',
                value: '',
                buttonText: 'Update Location',
                buttonIcon: 'location_on',
                buttonDisplay: 'both',
                MuiAttributes: { label: 'Address', variant: 'outlined' },
                MuiButtonAttributes: { variant: 'contained', color: 'primary' }
            },
            layout: { xs: 12, sm: 6 }
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
    { type: 'lineitemlist', label: 'Line Item List', icon: 'receipt_long' },
    { type: 'formrepeater', label: 'Form Repeater', icon: 'dynamic_form' },
    { type: 'signature', label: 'Signature', icon: 'draw' },
    { type: 'button', label: 'Button', icon: 'smart_button' },
    { type: 'typography', label: 'Typography', icon: 'text_format' },
    { type: 'datatable', label: 'Data Table', icon: 'table_chart' },
    { type: 'divider', label: 'Divider', icon: 'horizontal_rule' },
    { type: 'chip', label: 'Chip', icon: 'label' },
    { type: 'chipselect', label: 'Chip Select', icon: 'category' },
    { type: 'daterangepicker', label: 'Date Range', icon: 'date_range' },
    { type: 'rating', label: 'Rating', icon: 'star_rate' },
    { type: 'slider', label: 'Slider', icon: 'tune' },
    { type: 'tagsinput', label: 'Tags Input', icon: 'sell' },
    { type: 'togglebuttons', label: 'Toggle Buttons', icon: 'view_week' },
    { type: 'password', label: 'Password', icon: 'password' },
    { type: 'otp', label: 'OTP / PIN', icon: 'pin' },
    { type: 'phone', label: 'Phone', icon: 'phone' },
    { type: 'currency', label: 'Currency', icon: 'attach_money' },
    { type: 'fileupload', label: 'File Upload', icon: 'cloud_upload' },
    { type: 'alert', label: 'Alert', icon: 'info' },
    { type: 'computed', label: 'Computed', icon: 'functions' },
    { type: 'keyvalue', label: 'Key-Value', icon: 'data_object' },
    { type: 'numberstepper', label: 'Stepper (+/-)', icon: 'exposure' },
    { type: 'matrix', label: 'Matrix', icon: 'grid_on' },
    { type: 'consent', label: 'Consent', icon: 'gavel' },
    { type: 'colorpicker', label: 'Color Picker', icon: 'palette' },
    { type: 'markdown', label: 'Markdown', icon: 'notes' },
    { type: 'address', label: 'Address', icon: 'home' },
    { type: 'cascadeselect', label: 'Cascade Select', icon: 'account_tree' },
    { type: 'formwizard', label: 'Form Wizard', icon: 'linear_scale' },
    { type: 'geo', label: 'Geo / Map', icon: 'map' },
    { type: 'summary', label: 'Summary', icon: 'fact_check' },
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
    { type: 'locationfield', label: 'Location Field', icon: 'location_on' },
];
