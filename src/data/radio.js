export const radioData = [
  {
    id: 'staggerpenaltytype',
    type: 'radio',
    props: {
      id: 'staggerpenaltytype',
      value: 'Apply penalty now',
      MuiAttributes: {},
      MuiFCLAttributes: {
        label: '',
      },
      MuiFCLabels: ['Apply penalty now', 'Apply penalty after due date'],
      MuiRGAttributes: { row: true },
    },
    layout: {
      row: 4,
      xs: 9,
      sm: 9,
    },
    onChangeUpdate: [
      {
        formula: '({outstandingbalance} + ({outstandingbalance} * 0.10))',
        patchId: 'newoutstanding',
      },
      {
        formula: '({outstandingbalance} + ({outstandingbalance} * 0.10)) - {outstandingbalance}',
        patchId: 'penalty',
      },
    ],
  },
];

export const customRadioData = [];
