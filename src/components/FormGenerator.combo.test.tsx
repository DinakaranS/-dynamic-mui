import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

// One "category" driver changes BOTH:
//   1. another select's ("item") options — item.dependsOn=category + optionsMap
//   2. a subform — category.subforms
// The driver is a textfield so the change is deterministic in tests; in a real
// form it's a Select and behaves identically (same value → same engine reaction).
const schema = [
    {
        type: 'textfield',
        props: { id: 'category', MuiAttributes: { label: 'Category' } },
        subforms: [
            { conditionValue: 'fruit', data: [{ type: 'textfield', props: { id: 'ripeness', MuiAttributes: { label: 'Ripeness' } }, layout: { row: 1, xs: 12 } }] },
            { conditionValue: 'tool', data: [{ type: 'textfield', props: { id: 'voltage', MuiAttributes: { label: 'Voltage' } }, layout: { row: 1, xs: 12 } }] },
        ],
        layout: { row: 1, xs: 12 },
    },
    {
        type: 'select',
        props: { id: 'item', MuiBoxAttributes: { label: 'Item' } },
        dependsOn: 'category',
        optionsMap: {
            fruit: [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }],
            tool: [{ value: 'drill', label: 'Drill' }, { value: 'saw', label: 'Saw' }],
        },
        layout: { row: 2, xs: 12 },
    },
];

const pickCategory = (label: string) => {
    const input = screen.getByLabelText('Category');
    fireEvent.change(input, { target: { value: label } });
    fireEvent.blur(input);
};

describe('one selection drives BOTH dependent options AND a subform', () => {
    it('shows the matching subform for the selected category', () => {
        render(<FormGenerator guid="combo-1" data={schema as any} patch={{ category: 'fruit' }} />);
        // Subform for "fruit" is visible; the "tool" one is not.
        expect(screen.queryByLabelText('Ripeness')).not.toBeNull();
        expect(screen.queryByLabelText('Voltage')).toBeNull();
    });

    it('feeds the dependent select the right options for the selected category', () => {
        render(<FormGenerator guid="combo-2" data={schema as any} patch={{ category: 'tool', item: 'drill' }} />);
        // item=drill is valid for category=tool, so it stays.
        expect(FormData('combo-2').item).toBe('drill');
    });

    it('switching category updates BOTH: subform swaps and an invalid dependent value clears', () => {
        render(<FormGenerator guid="combo-3" data={schema as any} patch={{ category: 'fruit', item: 'apple' }} />);
        expect(FormData('combo-3').item).toBe('apple');
        expect(screen.queryByLabelText('Ripeness')).not.toBeNull();

        // Change category → 'tool'. 'apple' is no longer a valid item option → cleared,
        // and the subform swaps from Ripeness to Voltage — both from one selection.
        pickCategory('tool');
        expect(FormData('combo-3').item).toBeUndefined();
        expect(screen.queryByLabelText('Voltage')).not.toBeNull();
        expect(screen.queryByLabelText('Ripeness')).toBeNull();
    });
});
