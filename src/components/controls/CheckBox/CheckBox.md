Checkboxes can be used to turn an option on or off.

If you have multiple options appearing in a list, you can preserve space by using checkboxes instead of on/off switches. If you have a single option, avoid using a checkbox and use an on/off switch instead.

Basic checkboxes
```js
import {FormGenerator} from "../../FormGenerator";
import {checkBox} from '../../../data/checkbox';

<FormGenerator data={checkBox} guid="checkbox"/>
```

Label, Color & Size
```js
import {FormGenerator} from "../../FormGenerator";
import {checkBoxCustom} from '../../../data/checkbox';

<FormGenerator data={checkBoxCustom} guid="checkbox"/>
```
