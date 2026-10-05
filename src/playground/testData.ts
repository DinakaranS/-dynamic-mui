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
            // Options accept plain strings (label === value) OR
            // { label, value } objects for a separate display label vs. value.
            MuiFCLabels: [
                { label: 'Option A', value: 'a' },
                { label: 'Option B', value: 'b' }
            ],
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
        type: 'lineitemlist',
        props: {
            id: 'lineitemlist',
            value: [
                { fee: 0, miscellaneous1: 'qwerty' },
                { fee: 0, miscellaneous2: 'Keypad' },
                { fee: 0, miscellaneous3: 'Lion' },
                { fee: 0, miscellaneous4: 'mouse' },
                { fee: 0, miscellaneous5: 'Cat' }
            ]
        },
        layout: { xs: 12, sm: 7 }
    },
    {
        type: 'lineitemlist',
        props: {
            id: 'charges',
            keyPrefix: 'charge',
            showRowBadge: true,
            MuiAttributes: {
                rowBadge: {},
                description: {
                    label: 'Item Name',
                    variant: 'outlined'
                },
                fee: {
                    label: 'Amount'
                },
                addButton: {
                    color: 'success'
                },
                row: {}
            }
        },
        layout: { xs: 12 }
    },
    {
        type: 'formrepeater',
        props: {
            id: 'members',
            label: 'Member',
            count: 2,
            min: 1,
            max: 10,
            subFields: [
                {
                    type: 'textfield',
                    props: { id: 'fullName', MuiAttributes: { label: 'Full Name', fullWidth: true } },
                    layout: { xs: 12, sm: 6 },
                    visible: true
                },
                {
                    type: 'numberfield',
                    props: { id: 'age', MuiAttributes: { label: 'Age' } },
                    layout: { xs: 12, sm: 6 },
                    visible: true
                },
                {
                    type: 'select',
                    props: {
                        id: 'role',
                        MuiBoxAttributes: { label: 'Role' },
                        options: [
                            { value: 'admin', label: 'Admin' },
                            { value: 'member', label: 'Member' },
                            { value: 'viewer', label: 'Viewer' }
                        ]
                    },
                    layout: { xs: 12 },
                    visible: true
                }
            ]
        },
        layout: { xs: 12 }
    },
    // ── Collection demo ────────────────────────────────────────────────────
    {
        type: 'collection',
        props: {
            id: 'customerLocations',
            itemLabel: 'Customer Location',
            title: 'Customer Locations',
            description: 'Each service address, with its water services and backflow assemblies.',
            icon: 'location_on',
            color: 'primary',
            layout: 'cards',
            variant: 'outlined',
            addButton: { position: 'header', variant: 'contained', icon: 'add' },
            actions: { edit: true, delete: true },
            display: {
                title: 'customerName',
                subtitle: '{address}, {city}, {state} {zip}',
                subtitleIcon: 'place',
                avatar: 'none',
                badge: { field: 'status', colors: { active: 'success', pending: 'warning', inactive: 'default' } },
                detailsLayout: 'grid',
                details: [
                    { field: 'accountNumber', label: 'Account #', icon: 'tag' },
                    { field: 'locationType', label: 'Location type', icon: 'apartment' },
                    { field: 'contactName', label: 'Site contact', icon: 'person' },
                    { field: 'phone', label: 'Phone', icon: 'call' }
                ]
            },
            fields: [
                { type: 'textfield', props: { id: 'customerName', MuiAttributes: { label: 'Customer / business name', fullWidth: true } }, rules: { validation: [{ rule: 'mandatory', message: 'Customer name is required' }] }, layout: { row: 1, xs: 12, sm: 8 } },
                { type: 'textfield', props: { id: 'accountNumber', MuiAttributes: { label: 'Account #', fullWidth: true } }, layout: { row: 1, xs: 12, sm: 4 } },
                { type: 'select', props: { id: 'locationType', MuiBoxAttributes: { label: 'Location type' }, options: [{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }, { value: 'industrial', label: 'Industrial' }] }, layout: { row: 2, xs: 12, sm: 6 } },
                { type: 'select', props: { id: 'status', value: 'active', MuiBoxAttributes: { label: 'Status' }, options: [{ value: 'active', label: 'Active' }, { value: 'pending', label: 'Pending' }, { value: 'inactive', label: 'Inactive' }] }, layout: { row: 2, xs: 12, sm: 6 } },
                { type: 'textfield', props: { id: 'address', MuiAttributes: { label: 'Service address', fullWidth: true } }, layout: { row: 3, xs: 12 } },
                { type: 'textfield', props: { id: 'city', MuiAttributes: { label: 'City', fullWidth: true } }, layout: { row: 4, xs: 12, sm: 5 } },
                { type: 'textfield', props: { id: 'state', MuiAttributes: { label: 'State', fullWidth: true } }, layout: { row: 4, xs: 6, sm: 3 } },
                { type: 'textfield', props: { id: 'zip', MuiAttributes: { label: 'ZIP', fullWidth: true } }, layout: { row: 4, xs: 6, sm: 4 } },
                { type: 'textfield', props: { id: 'contactName', MuiAttributes: { label: 'Site contact', fullWidth: true } }, layout: { row: 5, xs: 12, sm: 6 } },
                { type: 'textfield', props: { id: 'phone', MuiAttributes: { label: 'Phone', fullWidth: true } }, layout: { row: 5, xs: 12, sm: 6 } }
            ],
            collections: [
                {
                    id: 'services',
                    itemLabel: 'Service',
                    icon: 'water_drop',
                    layout: 'table',
                    addButton: { position: 'header', variant: 'outlined', icon: 'add' },
                    fields: [
                        { type: 'select', props: { id: 'serviceType', MuiBoxAttributes: { label: 'Service type' }, options: [{ value: 'domestic', label: 'Domestic' }, { value: 'irrigation', label: 'Irrigation' }, { value: 'fire', label: 'Fire line' }] }, rules: { validation: [{ rule: 'mandatory', message: 'Service type is required' }] }, layout: { row: 1, xs: 12, sm: 6 } },
                        { type: 'select', props: { id: 'meterSize', MuiBoxAttributes: { label: 'Meter size' }, options: [{ value: '5/8"', label: '5/8"' }, { value: '3/4"', label: '3/4"' }, { value: '1"', label: '1"' }, { value: '2"', label: '2"' }] }, layout: { row: 1, xs: 12, sm: 6 } },
                        { type: 'textfield', props: { id: 'meterNumber', MuiAttributes: { label: 'Meter #', fullWidth: true } }, rules: { validation: [{ rule: 'mandatory', message: 'Meter # is required' }] }, layout: { row: 2, xs: 12, sm: 6 } },
                        { type: 'datetime', props: { id: 'installDate', MuiAttributes: { label: 'Install date', fullWidth: true } }, layout: { row: 2, xs: 12, sm: 6 } }
                    ],
                    display: {
                        title: 'serviceType',
                        titleLabel: 'Service type',
                        details: [
                            { field: 'meterNumber', label: 'Meter #', icon: 'speed' },
                            { field: 'meterSize', label: 'Meter size', icon: 'straighten' },
                            { field: 'installDate', label: 'Installed', icon: 'event' }
                        ]
                    }
                },
                {
                    id: 'backflows',
                    itemLabel: 'Backflow',
                    title: 'Backflow Assemblies',
                    icon: 'plumbing',
                    layout: 'table',
                    addButton: { position: 'header', variant: 'outlined', icon: 'add' },
                    fields: [
                        { type: 'select', props: { id: 'assemblyType', MuiBoxAttributes: { label: 'Assembly type' }, options: [{ value: 'RP', label: 'RP (Reduced pressure)' }, { value: 'DC', label: 'DC (Double check)' }, { value: 'RPDA', label: 'RPDA (RP detector)' }] }, rules: { validation: [{ rule: 'mandatory', message: 'Assembly type is required' }] }, layout: { row: 1, xs: 12, sm: 6 } },
                        { type: 'select', props: { id: 'size', MuiBoxAttributes: { label: 'Size' }, options: [{ value: '3/4"', label: '3/4"' }, { value: '1"', label: '1"' }, { value: '2"', label: '2"' }, { value: '4"', label: '4"' }] }, layout: { row: 1, xs: 12, sm: 6 } },
                        { type: 'textfield', props: { id: 'manufacturer', MuiAttributes: { label: 'Manufacturer', fullWidth: true } }, layout: { row: 2, xs: 12, sm: 6 } },
                        { type: 'textfield', props: { id: 'model', MuiAttributes: { label: 'Model', fullWidth: true } }, layout: { row: 2, xs: 12, sm: 6 } },
                        { type: 'textfield', props: { id: 'serialNumber', MuiAttributes: { label: 'Serial #', fullWidth: true } }, rules: { validation: [{ rule: 'mandatory', message: 'Serial # is required' }] }, layout: { row: 3, xs: 12, sm: 6 } },
                        { type: 'select', props: { id: 'testResult', MuiBoxAttributes: { label: 'Last test result' }, options: [{ value: 'pass', label: 'Passed' }, { value: 'fail', label: 'Failed' }, { value: 'due', label: 'Test due' }] }, layout: { row: 3, xs: 12, sm: 6 } }
                    ],
                    display: {
                        title: '{manufacturer} {model}',
                        titleLabel: 'Assembly',
                        badge: { field: 'testResult', label: 'Result', colors: { pass: 'success', fail: 'error', due: 'warning' } },
                        details: [
                            { field: 'assemblyType', label: 'Type' },
                            { field: 'serialNumber', label: 'Serial #' },
                            { field: 'size', label: 'Size' }
                        ]
                    }
                }
            ],
            value: [
                {
                    customerName: 'Riverside Medical Center',
                    accountNumber: '100-48213',
                    locationType: 'commercial',
                    status: 'active',
                    address: '1200 River Rd',
                    city: 'Austin',
                    state: 'TX',
                    zip: '78701',
                    contactName: 'Dana Ortiz',
                    phone: '(512) 555-0142',
                    services: [
                        { serviceType: 'domestic', meterSize: '2"', meterNumber: 'M-20931', installDate: '2019-04-12' },
                        { serviceType: 'fire', meterSize: '2"', meterNumber: 'M-20932' }
                    ],
                    backflows: [
                        { assemblyType: 'RP', size: '2"', manufacturer: 'Watts', model: 'LF909', serialNumber: 'W909-55120', testResult: 'pass' }
                    ]
                },
                {
                    customerName: 'Maple Street Residence',
                    accountNumber: '100-77310',
                    locationType: 'residential',
                    status: 'pending',
                    address: '48 Maple St',
                    city: 'Austin',
                    state: 'TX',
                    zip: '78704',
                    services: [
                        { serviceType: 'domestic', meterSize: '3/4"', meterNumber: 'M-88412' }
                    ],
                    backflows: []
                }
            ]
        },
        rules: { validation: [{ rule: 'mandatory', message: 'Add at least one customer location' }] },
        layout: { xs: 12 }
    },

    {
        type: 'locationfield',
        props: {
            id: 'location1',
            value: '123 Main Street, Springfield',
            buttonText: 'Update Location',
            buttonDisplay: 'both',
            MuiAttributes: { label: 'Address', variant: 'outlined' }
        },
        layout: { xs: 12, sm: 6 }
    },
    {
        type: 'locationfield',
        props: {
            id: 'location2',
            value: '',
            buttonText: 'Pick',
            buttonDisplay: 'icon',
            MuiAttributes: { label: 'Site Location' }
        },
        layout: { xs: 12, sm: 6 }
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
