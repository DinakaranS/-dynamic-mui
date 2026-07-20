# dynamic-mui

**Build rich, dynamic forms in React from a JSON schema — powered by Material UI.**

Render complex, reactive forms without writing form code. Fields can show/hide,
enable/disable, become required, compute their value, and drive each other's
options — all declaratively from data. Comes with 45+ controls, a typed schema
helper, an imperative API, i18n, and an optional visual builder / AI module.

```bash
npm install dynamic-mui
# peer dependencies (if you don't already have them)
npm install @mui/material @emotion/react @emotion/styled
```

---

## Quick start

```tsx
import { FormGenerator, FormData } from 'dynamic-mui';

const schema = [
  {
    type: 'textfield',
    props: { id: 'name', MuiAttributes: { label: 'Full name', fullWidth: true } },
    rules: { validation: [{ rule: 'mandatory', message: 'Name is required' }] },
    layout: { row: 1, xs: 12, md: 6 },
  },
  {
    type: 'select',
    props: {
      id: 'role',
      options: [{ value: 'dev', label: 'Developer' }, { value: 'design', label: 'Designer' }],
      MuiBoxAttributes: { label: 'Role' },
    },
    layout: { row: 1, xs: 12, md: 6 },
  },
];

export default function MyForm() {
  return (
    <FormGenerator
      guid="my-form"
      data={schema}
      onSubmit={(values, errors) => {
        if (errors.length === 0) console.log(FormData('my-form'));
      }}
    />
  );
}
```

Every field is an object of `{ type, props, layout, rules?, ...engine }`.
`layout` uses MUI Grid units (`row`, `xs`, `sm`, `md`, `lg`).

---

## Reading & writing form data

Data lives in a store keyed by the form's `guid`:

```ts
import { FormData, ClearFormData, useForm } from 'dynamic-mui';

FormData('my-form');        // { name: 'Ada', role: 'dev' }
ClearFormData('my-form');   // reset one form (or all forms if called with no guid)

const values = useForm('my-form'); // reactive hook inside a component
```

Prefill a form with `patch`:

```tsx
<FormGenerator guid="my-form" data={schema} patch={{ name: 'Ada', role: 'dev' }} />
```

Conditional fields, subforms, computed values, and `requiredWhen` all evaluate
correctly from the **initial** `patch` — not just after the first edit.

### Imperative API (`apiRef`)

```tsx
import { useRef } from 'react';
import { FormGenerator, FormApi } from 'dynamic-mui';

const api = useRef<FormApi>(null);

<FormGenerator guid="my-form" data={schema} apiRef={api} />;

api.current?.getValues();          // current values
api.current?.setValues({ ... });   // patch values in
api.current?.validate();           // boolean — runs validation, shows errors
api.current?.getErrors();          // array of { id, rule, message }
api.current?.reset();              // clear values
api.current?.submit();             // trigger the submit flow
```

---

## Dynamic rule engine

Add these keys to any field to make the form reactive. All conditions run
against the live form values.

| Key           | What it does                                              |
| ------------- | --------------------------------------------------------- |
| `visibleWhen` | Show the field only when a condition holds                |
| `disabledWhen`| Disable the field when a condition holds                  |
| `requiredWhen`| Make the field required when a condition holds            |
| `formula`     | Compute the field's value from other fields               |
| `dependsOn` + `optionsMap` | Swap a field's options based on another field |
| `subforms`    | Reveal a group of fields for a matching parent value      |

A condition is `{ field, op, value }` with operators `eq`, `neq`, `gt`, `gte`,
`lt`, `lte`, `in`, `nin`, `contains`, `startsWith`, `endsWith`, `empty`,
`notEmpty`, `truthy`, `falsy`, plus `all` / `any` / `none` groups.

```ts
// Show + require "reason" only when status is "other"
{
  type: 'textfield',
  props: { id: 'reason', MuiAttributes: { label: 'Reason' } },
  visibleWhen: { field: 'status', op: 'eq', value: 'other' },
  requiredWhen: { field: 'status', op: 'eq', value: 'other' },
  requiredMessage: 'Please tell us why',
  layout: { row: 2, xs: 12 },
}

// Live total = qty * price
{
  type: 'computed',
  props: { id: 'total', format: '0,0.00', MuiAttributes: { label: 'Total' } },
  formula: 'qty * price',
  layout: { row: 3, xs: 12 },
}

// State options depend on the selected country (one control, not many)
{
  type: 'select',
  props: { id: 'state', MuiBoxAttributes: { label: 'State' } },
  dependsOn: 'country',
  optionsMap: {
    us: [{ value: 'ca', label: 'California' }],
    in: [{ value: 'ka', label: 'Karnataka' }],
  },
  layout: { row: 4, xs: 12 },
}
```

`formula` supports `+ - * / %`, parentheses, unary minus, and
`SUM/AVG/MIN/MAX/ROUND/ABS/FLOOR/CEIL`.

---

## Validation

Per-field rules live under `rules.validation`:

```ts
rules: { validation: [{ rule: 'mandatory', message: 'Required' }] }
```

Cross-field validators compare against another field:
`equalsField`, `notEqualsField`, `gtField`, `gteField`, `ltField`, `lteField`.

```ts
// "confirm" must equal "password"
rules: { validation: [{ rule: 'equalsField', field: 'password', message: 'Passwords must match' }] }
```

Turn on an accessible summary and auto-focus of the first error with
`validationSummary`. Hidden (`visibleWhen`) fields are excluded from validation.

---

## Typed schema (`defineForm`)

Get full TypeScript autocompletion and compile-time checks for your schema:

```ts
import { defineForm, FormGenerator } from 'dynamic-mui';

const schema = defineForm([
  { type: 'textfield', props: { id: 'email', MuiAttributes: { label: 'Email' } }, layout: { row: 1, xs: 12 } },
]);

<FormGenerator guid="typed" data={schema} />;
```

---

## Internationalisation

```tsx
<FormGenerator
  guid="fr"
  data={schema}
  messages={{ required: 'Champ obligatoire', errorSummary: '{n} champ(s) à corriger' }}
/>
```

---

## Controls

Text & numbers · password · OTP · phone / international phone · currency ·
select · async autocomplete · autocomplete · cascade select · chip select ·
radio · checkbox · switch · toggle buttons · slider · rating · NPS · stepper ·
date / time / date-time / date-range pickers · file upload · signature ·
color picker · markdown & rich-text editors · tags · key-value · matrix ·
editable & data tables · line items · address · geo / location · consent ·
alert · divider · typography · charts (bar / line / pie / mixed), and more.

Each control is configured through `props` (its `MuiAttributes` /
`MuiBoxAttributes` map straight onto the underlying MUI component).

### Theming

Controls render under **your** MUI theme. Date/time pickers automatically match
the size and variant of your text fields, so a picker lines up with the fields
beside it.

---

## AI module (optional)

`dynamic-mui/ai` provides AI-assisted building blocks (generate a form from a
prompt, autofill, text assist, schema review) that talk to **your** proxy/relay
so your provider key stays server-side. See [`examples/`](./examples) for a
ready-to-deploy proxy (including an AWS Lambda BYOK relay).

---

## Playground

```bash
npm install
npm run dev        # visual builder + live demo gallery
```

Build forms visually, browse every control in multiple configurations, explore
real-world example forms, view the generated JSON, and copy it into your app.

---

## License

MIT © [Dinakaran S](https://github.com/DinakaranS)
