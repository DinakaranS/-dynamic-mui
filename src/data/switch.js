export const switchData = [
  {
    type: 'switch',
    props: {
      id: 'switchdefault',
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
    type: 'switch',
    props: {
      id: 'switch',
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
    type: 'switch',
    props: {
      id: 'switchdisabled',
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
    type: 'switch',
    props: {
      id: 'switchdisabledchecked',
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
export const switchCustom = [
  {
    type: 'switch',
    props: {
      id: 'switchlabel',
      MuiAttributes: {
        defaultChecked: true,
      },
      MuiFCLAttributes: {
        label: 'Label',
      },
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    type: 'switch',
    props: {
      id: 'switchlabelsmall',
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
      xs: 4,
      sm: 4,
    },
  },
  {
    type: 'switch',
    props: {
      id: 'switchlabelcolor',
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
      xs: 4,
      sm: 4,
    },
  },
];
