import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { FormGenerator, FormData, ClearFormData } from './FormGenerator';

afterEach(() => ClearFormData());

/**
 * Clearing a select has to take its subform with it.
 *
 * Choosing a value reveals the branch and switching values swaps it, but the
 * clear "×" left the previous branch on screen — so a form could be submitted
 * with fields belonging to a choice the user had just taken back.
 */

const schema = [
    {
        type: 'select',
        props: {
            id: 'category',
            options: [{ value: 'fruit', label: 'Fruit' }, { value: 'tool', label: 'Tool' }],
            MuiBoxAttributes: { label: 'Category' },
        },
        subforms: [
            { conditionValue: 'fruit', data: [{ type: 'textfield', props: { id: 'ripeness', MuiAttributes: { label: 'Ripeness' } }, layout: { row: 1, xs: 12 } }] },
            { conditionValue: 'tool', data: [{ type: 'numberfield', props: { id: 'voltage', MuiAttributes: { label: 'Voltage' } }, layout: { row: 1, xs: 12 } }] },
        ],
        layout: { row: 1, xs: 12 },
    },
];

describe('clearing a select', () => {
    it('removes the subform the cleared value had revealed', () => {
        render(<FormGenerator guid="cl-1" data={schema as any} patch={{ category: 'tool' }} />);
        expect(screen.queryByLabelText('Voltage')).toBeTruthy();

        fireEvent.click(screen.getByLabelText('Clear'));

        expect(screen.queryByLabelText('Voltage')).toBeNull();
    });

    it('clears the stored value, not just the input', () => {
        render(<FormGenerator guid="cl-2" data={schema as any} patch={{ category: 'tool' }} />);
        fireEvent.click(screen.getByLabelText('Clear'));

        expect(FormData('cl-2').category).toBeFalsy();
    });

    it('drops the subform’s captured value too', () => {
        // A voltage left behind would be submitted under a category nobody chose.
        render(<FormGenerator guid="cl-3" data={schema as any} patch={{ category: 'tool' }} />);
        const el = screen.getByLabelText('Voltage');
        fireEvent.change(el, { target: { value: '240' } });
        fireEvent.blur(el);
        expect(FormData('cl-3').voltage).toBe('240');

        fireEvent.click(screen.getByLabelText('Clear'));

        expect(FormData('cl-3').voltage).toBeUndefined();
    });

    it('stays cleared when the parent re-renders with a new data array', () => {
        /*
         * The real-world case. `updatePatchData` does
         *     response[guid] = { ...response[guid], ...patch }
         * with the patch LAST, inside a `useMemo` keyed on `[newPatch, data,
         * guid]`. A host that rebuilds its field array — am-app does, whenever
         * dependent options are recomputed — re-runs that memo, and the stale
         * patch overwrites what the user just cleared. The value comes back,
         * and with it the subform.
         */
        const { rerender } = render(
            <FormGenerator guid="cl-4" data={schema as any} patch={{ category: 'tool' }} />,
        );
        fireEvent.click(screen.getByLabelText('Clear'));
        expect(screen.queryByLabelText('Voltage')).toBeNull();

        // Same content, new identity — exactly what a parent re-render produces.
        rerender(<FormGenerator guid="cl-4" data={[...schema] as any} patch={{ category: 'tool' }} />);

        expect(FormData('cl-4').category).toBeFalsy();
        expect(screen.queryByLabelText('Voltage')).toBeNull();
    });
});

describe('applying a patch only once', () => {
    it('still applies a genuinely new patch', () => {
        // The guard must not stop a parent loading a different record.
        const { rerender } = render(
            <FormGenerator guid="ap-1" data={schema as any} patch={{ category: 'tool' }} />,
        );
        expect(screen.queryByLabelText('Voltage')).toBeTruthy();

        rerender(<FormGenerator guid="ap-1" data={schema as any} patch={{ category: 'fruit' }} />);

        expect(screen.queryByLabelText('Ripeness')).toBeTruthy();
        expect(screen.queryByLabelText('Voltage')).toBeNull();
    });

    it('seeds a new store when the guid changes without a remount', () => {
        // The guard is per guid: swapping guid with no React `key` keeps this
        // instance, and the new store still has to receive the patch.
        const { rerender } = render(
            <FormGenerator guid="ap-2" data={schema as any} patch={{ category: 'tool' }} />,
        );
        rerender(<FormGenerator guid="ap-3" data={schema as any} patch={{ category: 'tool' }} />);

        expect(FormData('ap-3').category).toBe('tool');
    });
});
