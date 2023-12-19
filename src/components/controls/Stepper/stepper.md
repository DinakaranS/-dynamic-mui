Vertical component:

```js
import { FormGenerator } from "../../FormGenerator";
import { mui } from '../../../data/stepper';

<FormGenerator data={mui} guid="stepper"
               // onStepChange={(activeStep, isScreenChange, isLastStep) => console.log(activeStep, isScreenChange, isLastStep)}
               patch={{ stepper: { cost: '123456', start:'12/22/2023',end:'12/24/2023' } }}/>
```
