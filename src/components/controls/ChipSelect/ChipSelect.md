ChipSelect renders a set of premium, pill-shaped selectable chips. It supports two modes — **single select** (radio-like, returns a scalar) and **multi select** (returns an array). Every item is fully configurable: label, value, leading icon, colour, and disabled state.

Single select
```js
import { FormGenerator } from '../../FormGenerator';

const data = [
  {
    type: 'chipselect',
    props: {
      id: 'plan',
      label: 'Choose a plan',
      multiple: false,
      options: [
        { value: 'free', label: 'Free' },
        { value: 'pro', label: 'Pro', icon: 'star', color: 'secondary' },
        { value: 'team', label: 'Team' },
      ],
    },
    layout: { row: 1, xs: 12 },
  },
];

<FormGenerator data={data} guid="chip-single" patch={{}} />
```

Multi select
```js
import { FormGenerator } from '../../FormGenerator';

const data = [
  {
    type: 'chipselect',
    props: {
      id: 'interests',
      label: 'Pick your interests',
      multiple: true,
      options: [
        { value: 'design', label: 'Design', icon: 'palette' },
        { value: 'dev', label: 'Development', icon: 'code' },
        { value: 'marketing', label: 'Marketing', icon: 'campaign' },
      ],
    },
    rules: { validation: [{ rule: 'mandatoryselect', message: 'Pick at least one' }] },
    layout: { row: 1, xs: 12 },
  },
];

<FormGenerator data={data} guid="chip-multi" patch={{ interests: ['design', 'dev'] }} />
```
