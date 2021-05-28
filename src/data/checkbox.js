export const checkBox = [
  {
    type: 'checkbox',
    props: {
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
