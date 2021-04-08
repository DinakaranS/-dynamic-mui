The TextField wrapper component is a complete form control including a label, input and help text.

It supports standard, outlined and filled styling

```js
import * as MUI from '@material-ui/core';
import {FormGenerator} from "../../FormGenerator";
import {mui} from '../../../data/textfield';

<FormGenerator library={MUI} data={mui} guid="textfield"/>
```
```js
import {mui} from '../../../data/textfield';
import JSONTree from 'react-json-tree';

<JSONTree data={mui} />
```

Validation:

```js
import * as MUI from '@material-ui/core';
import {FormGenerator} from "../../FormGenerator";
import {validation} from '../../../data/textfield';

<FormGenerator library={MUI} data={validation} guid="textfield"/>
```
```
import {validation} from '../../../data/textfield';
import JSONTree from 'react-json-tree';

<JSONTree data={validation} />
```

InputAdornment:

```js
import * as MUI from '@material-ui/core';
import {FormGenerator} from "../../FormGenerator";
import {inputAdornment} from '../../../data/textfield';

<FormGenerator library={MUI} data={inputAdornment} patch={{firstname:'dinakaran'}} guid="textfield"/>
```
```
import {sizesAndLayout} from '../../../data/textfield';
import JSONTree from 'react-json-tree';

<JSONTree data={sizesAndLayout} />
```

Sizes & Layout:

```js
import * as MUI from '@material-ui/core';
import {FormGenerator} from "../../FormGenerator";
import {sizesAndLayout} from '../../../data/textfield';

<FormGenerator library={MUI} data={sizesAndLayout} guid="textfield"/>
```
