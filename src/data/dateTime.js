export const mui = [
  {
    type: 'datetime',
    props: {
      id: 'datetime',
      MuiAttributes: {
        placeholder: 'Standard',
        variant: 'standard',
        fullWidth: true,
        sx: { width: '100%' },
      },
      value: '12/09/2023',
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
];
export const responsiveness = [
  {
    type: 'datetime',
    props: {
      id: 'datetimemobile',
      MuiAttributes: { label: 'For mobile', fullWidth: true, variant: 'standard' },
      name: 'MobileDatePicker',
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    type: 'datetime',
    props: {
      id: 'datetimestandard',
      MuiAttributes: { label: 'For desktop', fullWidth: true, variant: 'standard' },
      name: 'DesktopDatePicker',
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
  {
    type: 'datetime',
    props: {
      id: 'datetimeresponsive',
      MuiAttributes: {
        label: 'Responsive',
        fullWidth: true,
        variant: 'standard',
        disableFuture: true,
        openTo: 'year',
        views: ['year', 'month', 'day'],
      },
    },
    layout: {
      row: 1,
      xs: 4,
      sm: 4,
    },
  },
];

export const dateRange = [
  {
    type: 'daterangepicker',
    props: {
      id: 'daterangepicker',
      MuiAttributes: {
        fullWidth: true,
        variant: 'standard',
        startText: 'Check-in',
        endText: 'Check-out',
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];

export const dateTimePicker = [
  {
    type: 'datetimepicker',
    props: {
      id: 'datetimepicker',
      MuiAttributes: {
        label: 'Standard',
        fullWidth: true,
        variant: 'standard',
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];

export const timePicker = [
  {
    type: 'timepicker',
    props: {
      id: 'timepicker',
      MuiAttributes: {
        label: 'Standard',
        fullWidth: true,
        variant: 'standard',
        disableUnderline: true,
        // sx: {
        //   width: '100%',
        //   '& .MuiInputLabel-root.Mui-focused': { color: '#979797' }, // styles the label
        //   '& .MuiOutlinedInput-root': {
        //     '&:hover > fieldset': { borderColor: 'red' },
        //     height: '48px',
        //     borderRadius: '8px',
        //   },
        // },
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];
