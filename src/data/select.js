const options = [
  { value: 'ocean', label: 'Ocean', color: '#00B8D9' },
  { value: 'blue', label: 'Blue', color: '#0052CC', disabled: true },
  { value: 'purple', label: 'Purple', color: '#5243AA' },
  { value: 'red', label: 'Red', color: '#FF5630' },
  { value: 'orange', label: 'Orange', color: '#FF8B00' },
  { value: 'yellow', label: 'Yellow', color: '#FFC400' },
  { value: 'green', label: 'Green', color: '#36B37E' },
  { value: 'forest', label: 'Forest', color: '#00875A' },
  { value: 'slate', label: 'Slate', color: '#253858' },
  { value: 'silver', label: 'Silver', color: '#666666' },
];
export const select = [
  {
    type: 'select',
    props: {
      id: 'simpleselect',
      MuiAttributes: {},
      options,
      MuiBoxAttributes: {
        label: 'Colors',
      },
      InputProps: {
        MuiInputAdornment: {},
        position: 'start',
        icon: 'account_circle',
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];
export const multiSelect = [
  {
    type: 'select',
    props: {
      id: 'multiselect',
      MuiAttributes: {
        multiple: true,
        disableCloseOnSelect: true,
      },
      options,
      MuiBoxAttributes: {
        label: 'Colors',
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];
