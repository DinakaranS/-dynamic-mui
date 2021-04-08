Build dynamic forms using Material UI

## Installation

`npm install @material-ui/core@next @emotion/react @emotion/styled`
`npm install dynamic-mui --save`

##Usage 

`import { FormGenerator } from 'dynamic-mui/dist-modules/components/FormGenerator'`;
`import * as MUI from '@material-ui/core';`

`<FormGenerator
data={[{
type: 'textfield',
props: { MuiAttributes: { placeholder: 'Standard', fullWidth: true, variant: 'standard' } },
layout: {
row: 1,
xs: 4,
sm: 4,
},
},
]}
guid="Testing"
library={MUI}
/>`
