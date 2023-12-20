Basic component:

```js
import { FormGenerator } from "../../FormGenerator";

<FormGenerator data={[{
  type: "pie",
  props: {
    MuiChartAttributes:{
      width: 500,
      height: 300,
      series:[
        {
          data: [
            { id: 0, value: 10, label: 'series A' },
            { id: 1, value: 15, label: 'series B' },
            { id: 2, value: 20, label: 'series C' },
          ],
        },
      ],
    }
  },
  layout: {
    xs: 12, sm: 6, md: 12
  }
}]} guid="typography"/>;
```
