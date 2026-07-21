import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

const schema = [
    {
        type: 'select',
        props: { id: 'category', options: [{ value: 'fruit', label: 'Fruit' }, { value: 'tool', label: 'Tool' }], MuiBoxAttributes: { label: 'Category' } },
        subforms: [
            { conditionValue: 'fruit', data: [{ type: 'textfield', props: { id: 'ripeness', MuiAttributes: { label: 'Ripeness' } }, layout: { row: 1, xs: 12 } }] },
            { conditionValue: 'tool', data: [{ type: 'numberfield', props: { id: 'voltage', MuiAttributes: { label: 'Voltage' } }, layout: { row: 1, xs: 12 } }] },
        ],
        layout: { row: 1, xs: 12 },
    },
];

// Same schema but a textfield driver so the change is deterministic in tests.
const tfSchema = [
    {
        type: 'textfield',
        props: { id: 'category', MuiAttributes: { label: 'Category' } },
        subforms: [
            { conditionValue: 'fruit', data: [{ type: 'textfield', props: { id: 'ripeness', MuiAttributes: { label: 'Ripeness' } }, layout: { row: 1, xs: 12 } }] },
            { conditionValue: 'tool', data: [{ type: 'numberfield', props: { id: 'voltage', MuiAttributes: { label: 'Voltage' } }, layout: { row: 1, xs: 12 } }] },
        ],
        layout: { row: 1, xs: 12 },
    },
];

const setField = (label: string, value: string) => {
    const el = screen.getByLabelText(label);
    fireEvent.change(el, { target: { value } });
    fireEvent.blur(el);
};

describe('subform value capture into the parent store', () => {
    it('captures a subform field value under the parent guid (initial patch)', () => {
        render(<FormGenerator guid="sc-1" data={schema as any} patch={{ category: 'tool' }} />);
        setField('Voltage', '7777');
        expect(FormData('sc-1').voltage).toBe('7777');
    });

    it('captures a subform field value after CHANGING the driver (not just initial patch)', () => {
        render(<FormGenerator guid="sc-2" data={tfSchema as any} />);
        setField('Category', 'tool');           // reveals the tool subform
        setField('Voltage', '7777');            // fill the subform field
        expect(FormData('sc-2').voltage).toBe('7777'); // <-- reported broken
    });

    it('clears the old subform value in the STORE when the driver changes away', () => {
        render(<FormGenerator guid="sc-3" data={tfSchema as any} />);
        setField('Category', 'tool');
        setField('Voltage', '7777');
        expect(FormData('sc-3').voltage).toBe('7777');
        setField('Category', 'fruit');          // swap subform → voltage no longer reachable
        expect(FormData('sc-3').voltage).toBeUndefined();
    });

    it('does NOT re-show a previous branch\'s values after switching away and back', () => {
        render(<FormGenerator guid="sc-swap" data={tfSchema as any} />);
        // tool branch → fill voltage
        setField('Category', 'tool');
        setField('Voltage', '7777');
        expect(FormData('sc-swap').voltage).toBe('7777');

        // switch to fruit (parent clears voltage) then back to tool
        setField('Category', 'fruit');
        expect(FormData('sc-swap').voltage).toBeUndefined();
        setField('Category', 'tool');

        // The Voltage field must be EMPTY (matching the cleared store), not the
        // stale "7777" reappearing from a shared subform store.
        const voltage = screen.getByLabelText('Voltage') as HTMLInputElement;
        expect(voltage.value).toBe('');
        expect(FormData('sc-swap').voltage).toBeUndefined();
    });

    it('captures a subform value when the driver is a SELECT (Autocomplete)', () => {
        render(<FormGenerator guid="sc-4" data={schema as any} />);
        // Select "Tool" via the Autocomplete keyboard flow.
        const cat = screen.getByLabelText('Category');
        cat.focus();
        fireEvent.change(cat, { target: { value: 'Tool' } });
        fireEvent.keyDown(cat, { key: 'ArrowDown' });
        fireEvent.keyDown(cat, { key: 'Enter' });
        expect(FormData('sc-4').category).toBe('tool');

        setField('Voltage', '7777');
        expect(FormData('sc-4').voltage).toBe('7777'); // <-- the reported failure
    });
});
