Vertical component:

```js
import { FormGenerator } from "../../FormGenerator";
import { mui } from '../../../data/stepper';

<FormGenerator data={mui} guid="stepper" activeStep={0}
               patch={{start:'12/02/2023'}}
               // onStepChange={(activeStep, isScreenChange, isLastStep) => console.log(activeStep, isScreenChange, isLastStep)}
               />
```
