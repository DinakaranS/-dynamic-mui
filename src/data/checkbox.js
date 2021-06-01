export const checkBox = [
  {
    type: 'checkbox',
    props: {
      id: 'defaultChecked',
      MuiAttributes: {
        defaultChecked: true,
      },
      MuiFCLAttributes: {
        label: '',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
  {
    type: 'checkbox',
    props: {
      id: 'simple',
      MuiAttributes: {},
      MuiFCLAttributes: {
        label: '',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
  {
    type: 'checkbox',
    props: {
      id: 'disabled',
      MuiAttributes: {
        disabled: true,
      },
      MuiFCLAttributes: {
        label: '',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
  {
    type: 'checkbox',
    props: {
      id: 'disabledchecked',
      MuiAttributes: {
        disabled: true,
        checked: true,
      },
      MuiFCLAttributes: {
        label: '',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
];
export const checkBoxCustom = [
  {
    type: 'checkbox',
    props: {
      id: 'label',
      MuiAttributes: {
        defaultChecked: true,
      },
      MuiFCLAttributes: {
        label: 'Label',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
  {
    type: 'checkbox',
    props: {
      id: 'labelsmall',
      MuiAttributes: {
        size: 'small',
        defaultChecked: true,
        color: 'secondary',
      },
      MuiFCLAttributes: {
        label: 'Label',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
  {
    type: 'checkbox',
    props: {
      id: 'labelcolordefault',
      MuiAttributes: {
        defaultChecked: true,
        color: 'default',
      },
      MuiFCLAttributes: {
        label: 'Label',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
  {
    type: 'checkbox',
    props: {
      id: 'labelcolorgreen',
      MuiAttributes: {
        defaultChecked: true,
        sx: {
          color: 'green',
          '&.Mui-checked': {
            color: 'green',
          },
        },
      },
      MuiFCLAttributes: {
        label: 'Label',
      },
    },
    layout: {
      row: 1,
      xs: 3,
      sm: 3,
    },
  },
];
