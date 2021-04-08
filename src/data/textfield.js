export const mui = [
  {
    type: 'textfield',
    props: { MuiAttributes: { placeholder: 'Standard', fullWidth: true, variant: 'standard' } },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    type: 'textfield',
    props: { MuiAttributes: { placeholder: 'Filled', fullWidth: true, variant: 'filled' } },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    type: 'textfield',
    props: { MuiAttributes: { placeholder: 'Outlined', fullWidth: true, variant: 'outlined' } },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
];

export const validation = [
  {
    type: 'textfield',
    props: { MuiAttributes: { label: 'Mandatory', fullWidth: true, variant: 'outlined' } },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
    rules: {
      validation: [
        {
          rule: 'mandatory',
          message: 'Please enter your first name.',
        },
      ],
    },
  },
  {
    id: 'password',
    type: 'textfield',
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
    props: {
      id: 'password',
      MuiAttributes: {
        type: 'password',
        fullWidth: true,
        label: 'Password',
      },
    },
  },
  {
    id: 'number',
    type: 'textfield',
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
    props: {
      id: 'number',
      MuiAttributes: {
        type: 'number',
        fullWidth: true,
        label: 'Number',
      },
    },
  },
  {
    id: 'currency',
    type: 'textfield',
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
    props: {
      id: 'currency',
      MuiAttributes: {
        fullWidth: true,
        label: 'Currency',
        name: 'Currency',
      },
      format: '$0,0.00',
    },
  },
];

export const inputAdornment = [
  {
    id: 'firstname',
    type: 'textfield',
    props: {
      id: 'firstname',
      MuiAttributes: {
        fullWidth: true,
        InputLabelProps: {
          shrink: true,
        },
        margin: 'normal',
        label: 'First Name',
      },
      InputProps: {
        MuiInputAdornment: {},
        position: 'start',
        icon: 'account_circle',
      },
    },
    rules: {
      validation: [
        {
          rule: 'mandatory',
          message: 'Please enter your first name.',
        },
      ],
    },
    layout: {
      row: 1,
      xs: 6,
      sm: 6,
    },
  },
  {
    id: 'textfieldoutlined',
    type: 'textfield',
    props: {
      id: 'textfieldoutlined',
      MuiAttributes: {
        fullWidth: true,
        InputLabelProps: {
          shrink: true,
        },
        margin: 'normal',
        helperText: 'Weight',
        label: 'First Name',
      },
      InputProps: {
        MuiInputAdornment: { position: 'end' },
        position: 'end',
        text: 'KG',
      },
    },
    layout: {
      row: 1,
      xs: 6,
      sm: 6,
    },
  },
];

export const sizesAndLayout = [
  {
    id: 'textfieldoutlined',
    type: 'textfield',
    props: {
      id: 'textfieldoutlined',
      MuiAttributes: {
        fullWidth: true,
        size: 'small',
        label: 'Small',
      },
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    id: 'textfieldoutlined',
    type: 'textfield',
    props: {
      id: 'textfieldoutlined',
      MuiAttributes: {
        fullWidth: true,
        label: 'Normal',
      },
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    id: 'textfieldoutlined',
    type: 'textfield',
    props: {
      id: 'textfieldoutlined',
      MuiAttributes: {
        fullWidth: true,
        label: 'Disabled',
        disabled: true,
      },
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    id: 'textfieldoutlined',
    type: 'textfield',
    props: {
      id: 'textfieldoutlined',
      MuiAttributes: {
        fullWidth: true,
        label: 'Fullwidth',
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];
