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
