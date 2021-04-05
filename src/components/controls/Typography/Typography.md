Basic component:

```js
import * as MUI from '@material-ui/core';
import {FormGenerator} from "../../FormGenerator";

<FormGenerator library={MUI} data={[{
    type: 'typography',
    props: {
        text: 'Hi'
    },
    layout: {
        xs:12, sm:6, md:12
    }
}]} guid="typography"/>
```

Component styled:

```js
import * as MUI from '@material-ui/core';
import {FormGenerator} from "../../FormGenerator";

<FormGenerator library={MUI} data={[{
    type: 'typography',
    props: {
        text: 'Styled with color',
        MuiAttributes: {
            color: 'secondary',
            variant: 'h6',
            component: "h2", gutterBottom: true
        }
    },
    layout: {
        xs:12, sm:6, md:12
    }
}]} guid="typography"/>
```

