export const mui = [
  {
    type: 'datetime',
    props: { MuiAttributes: { placeholder: 'Standard', fullWidth: true, variant: 'standard' } },
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
