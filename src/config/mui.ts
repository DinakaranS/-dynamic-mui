export interface ComponentConfig {
    type: string;
    map: string;
    options?: Record<string, any>;
}

export type MuiConfigMap = Record<string, ComponentConfig>;

const mui: MuiConfigMap = {
    textfield: {
        type: 'TextField',
        map: 'TextField',
    },
    typography: {
        type: 'Typography',
        map: 'Typography',
    },
    datatable: {
        type: 'Table',
        map: 'Table',
    },
    datetime: {
        type: 'DateTime',
        map: 'DateTime',
    },
    daterangepicker: {
        type: 'DateRangePicker',
        map: 'DateRangePicker',
    },
    datetimepicker: {
        type: 'DateTimePicker',
        map: 'DateTimePicker',
    },
    timepicker: {
        type: 'TimePicker',
        map: 'TimePicker',
    },
    select: {
        type: 'Select',
        map: 'Select',
    },
    checkbox: {
        type: 'CheckBox',
        map: 'CheckBox',
    },
    switch: {
        type: 'Switch',
        map: 'Switch',
    },
    radio: {
        type: 'Radio',
        map: 'Radio',
    },
    stepper: {
        type: 'Stepper',
        map: 'Stepper',
    },
    bar: {
        type: 'Bar',
        map: 'Bar',
    },
    line: {
        type: 'Line',
        map: 'Line',
    },
    pie: {
        type: 'Pie',
        map: 'Pie',
    },
    mixchart: {
        type: 'MixChart',
        map: 'MixChart',
    },
    divider: {
        type: 'Divider',
        map: 'Divider',
    },
    chip: {
        type: 'Chip',
        map: 'Chip',
    },
    chipselect: {
        type: 'ChipSelect',
        map: 'ChipSelect',
    },
    button: {
        type: 'Button',
        map: 'Button',
    },
    rating: {
        type: 'Rating',
        map: 'Rating',
    },
    slider: {
        type: 'Slider',
        map: 'Slider',
    },
    tagsinput: {
        type: 'TagsInput',
        map: 'TagsInput',
    },
    togglebuttons: {
        type: 'ToggleButtons',
        map: 'ToggleButtons',
    },
    password: {
        type: 'PasswordField',
        map: 'PasswordField',
    },
    otp: {
        type: 'OtpField',
        map: 'OtpField',
    },
    phone: {
        type: 'PhoneField',
        map: 'PhoneField',
    },
    currency: {
        type: 'CurrencyField',
        map: 'CurrencyField',
    },
    fileupload: {
        type: 'FileUpload',
        map: 'FileUpload',
    },
    alert: {
        type: 'Alert',
        map: 'Alert',
    },
    computed: {
        type: 'Computed',
        map: 'Computed',
    },
    keyvalue: {
        type: 'KeyValueField',
        map: 'KeyValueField',
    },
    numberstepper: {
        type: 'NumberStepper',
        map: 'NumberStepper',
    },
    matrix: {
        type: 'MatrixField',
        map: 'MatrixField',
    },
    consent: {
        type: 'ConsentField',
        map: 'ConsentField',
    },
    colorpicker: {
        type: 'ColorPicker',
        map: 'ColorPicker',
    },
    markdown: {
        type: 'MarkdownEditor',
        map: 'MarkdownEditor',
    },
    address: {
        type: 'AddressField',
        map: 'AddressField',
    },
    cascadeselect: {
        type: 'CascadeSelect',
        map: 'CascadeSelect',
    },
    formwizard: {
        type: 'FormWizard',
        map: 'FormWizard',
    },
    summary: {
        type: 'SummaryField',
        map: 'SummaryField',
    },
    geo: {
        type: 'GeoField',
        map: 'GeoField',
    },
    richtext: {
        type: 'RichTextEditor',
        map: 'RichTextEditor',
    },
    nps: {
        type: 'NpsScale',
        map: 'NpsScale',
    },
    editabletable: {
        type: 'EditableTable',
        map: 'EditableTable',
    },
    intlphone: {
        type: 'IntlPhone',
        map: 'IntlPhone',
    },
    asyncautocomplete: {
        type: 'AsyncAutocomplete',
        map: 'AsyncAutocomplete',
    },
    list: {
        type: 'List',
        map: 'List',
    },
    numberfield: {
        type: 'NumberField',
        map: 'NumberField',
    },
    multitextbox: {
        type: 'MultiTextbox',
        map: 'MultiTextbox',
    },
    lineitemlist: {
        type: 'LineItemList',
        map: 'LineItemList',
    },
    formrepeater: {
        type: 'FormRepeater',
        map: 'FormRepeater',
    },
    signature: {
        type: 'Signature',
        map: 'Signature',
    },
    group: {
        type: 'Group',
        map: 'Group',
    },
    accordion: {
        type: 'Accordion',
        map: 'Accordion',
    },
    tabs: {
        type: 'Tabs',
        map: 'Tabs',
    },
    autocomplete: {
        type: 'AutoComplete',
        map: 'AutoComplete',
    },
    imagelist: {
        type: 'ImgList',
        map: 'ImgList',
    },
    hyperlink: {
        type: 'Hyperlink',
        map: 'Hyperlink',
    },
    locationfield: {
        type: 'LocationField',
        map: 'LocationField',
    },
};

export default mui;
