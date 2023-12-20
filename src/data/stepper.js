export const mui = [
  {
    type: 'stepper',
    props: {
      id: 'stepper',
      MuiBoxAttributes: {},
      MuiStepLabelOptionalLabel: 'Last Step',
      MuiStepperAttributes: {},
      orientation: 'horizontal',
      MuiSteps: [
        {
          label: 'Select Service Request',
          components: [
            {
              type: 'select',
              props: {
                id: 'servicetype',
                MuiAttributes: { required: true },
                options: [
                  { value: 'New Installation', label: 'New Installation' },
                  { value: 'Change Classification', label: 'Change Classification' },
                  { value: 'Change Meter', label: 'Change Meter' },
                  { value: 'Change Name', label: 'Change Name' },
                  { value: 'Transfer Location', label: 'Transfer Location' },
                  { value: 'Recheck Read', label: 'Recheck Read' },
                  { value: 'Disconnection - Voluntary', label: 'Disconnection - Voluntary' },
                ],
                MuiBoxAttributes: {},
              },
            },
          ],
        },
        {
          label: 'Assign Priority',
          isScreenChange: true,
          components: [
            {
              type: 'select',
              props: {
                id: 'priority',
                MuiAttributes: { required: true },
                options: [
                  { value: 'Emergency', label: 'Emergency' },
                  { value: 'High', label: 'High' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Low', label: 'Low' },
                ],
                MuiBoxAttributes: {},
              },
            },
          ],
        },
        {
          label: 'Choose Schedule In Calendar',
          components: [
            {
              id: 'start',
              type: 'datetime',
              props: {
                id: 'start',
                MuiAttributes: {
                  label: 'Start',
                  fullWidth: true,
                  disabled: true,
                  sx: { width: '100%' },
                },
              },
            },
            {
              id: 'end',
              type: 'datetime',
              props: {
                id: 'end',
                MuiAttributes: {
                  label: 'End',
                  fullWidth: true,
                  disabled: true,
                  sx: { width: '100%', mt: 1.5 },
                },
              },
            },
          ],
        },
        {
          label: 'Assign User',
          components: [
            {
              type: 'select',
              props: {
                id: 'assigntouser',
                MuiAttributes: {},
                options: [
                  { value: 'Dinakaran', label: 'Dinakaran' },
                  { value: 'Thiyagarajan', label: 'Thiyagarajan' },
                ],
                MuiBoxAttributes: {},
              },
            },
          ],
        },
        {
          label: 'Determine Cost',
          components: [
            {
              id: 'determinecost',
              type: 'radio',
              props: {
                id: 'determinecost',
                value: 'Skip',
                MuiAttributes: {},
                MuiFLabelIcon: {},
                MuiFLabel: '',
                MuiFCLAttributes: {},
                MuiFCLabels: ['Skip', 'Assign'],
                MuiRGAttributes: { row: true },
              },
            },
            {
              id: 'cost',
              type: 'textfield',
              props: {
                id: 'cost',
                MuiAttributes: {},
              },
            },
          ],
        },
        {
          label: 'Description',
          components: [
            {
              id: 'description',
              type: 'textfield',
              props: {
                id: 'description',
                MuiAttributes: {
                  multiline: true,
                  rows: 3,
                },
              },
            },
          ],
        },
        {
          label: 'Review',
        },
      ],
      MuiStepAttributes: {},
      MuiStepLabelAttributes: {},
      MuiStepContentAttributes: {},
      MuiButtonAttributes: {
        back: {},
        next: { sx: { bgcolor: 'primary.dark' } },
        final: { sx: { bgcolor: 'success.light' } },
        backLabel: '',
        nextLabel: '',
        finalLabel: '',
      },
    },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];

export const customMui = [
  {
    type: 'stepper',
    props: { MuiAttributes: {} },
    layout: {
      row: 1,
      xs: 12,
      sm: 12,
    },
  },
];
