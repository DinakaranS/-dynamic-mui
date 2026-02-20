# dynamic-mui

A powerful, dynamic form builder and generator for React using Material UI.

## Features (v2.0.0)

- **Dynamic Form Generation**: Render complex forms from JSON schema.
- **Visual Form Builder**: Drag-and-drop interface to build forms visually.
- **New Documentation Mode**: Integrated documentation sidebar with component details.
- **Advanced Validation**: Mandatory field validation with visual indicators (`*` and red error states).
- **Rich Component Library**: Includes TextField, Select, Date/Time Pickers, Checkbox, Radio, Switch, Signature, and more.
- **JSON Editing**: Edit form schema directly or use the visual builder.
- **Data Preview**: View current form data in real-time.

## Installation

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install dynamic-mui --save
```

## Usage

```tsx
import { FormGenerator } from 'dynamic-mui';

const formSchema = [
  {
    type: 'textfield',
    props: {
        id: 'name',
        label: 'Full Name',
        MuiAttributes: { fullWidth: true, variant: 'outlined' },
        rules: {
            validation: [{ rule: 'mandatory', message: 'Name is required' }]
        }
    },
    layout: { row: 1, xs: 12, md: 6 }
  }
];

export default function DynamicForm() {
  const handleSubmit = (data) => {
    console.log('Form Data:', data);
  };

  return (
    <FormGenerator
      data={formSchema}
      onSubmit={handleSubmit}
    />
  );
}
```

## Local Development (Playground)

To run the local playground and test changes:

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173` (or the port shown in terminal).

The playground allows you to build forms visually, view the generated JSON, and test validation.

## License

MIT © [Dinakaran S](https://github.com/DinakaranS)
