Basic component:

```js
import { FormGenerator } from "../../FormGenerator";

<FormGenerator data={[{
  type: "bar",
  props: {
    MuiChartAttributes:{
      height: 300,
      series:[{ data: [2400, 1398, 9800, 3908, 4800, 3800, 4300], label: "dk", id: "pvId" }],
      xAxis:[{ data: [
          'Page A',
          'Page B',
          'Page C',
          'Page D',
          'Page E',
          'Page F',
          'Page G',
        ], scaleType: "band" }]
    }
  },
  layout: {
    xs: 12, sm: 6, md: 12
  }
}]} guid="typography"/>;
```
