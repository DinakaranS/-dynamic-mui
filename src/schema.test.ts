import { describe, it, expect } from 'vitest';
import { defineForm, type TypedSchema } from './schema';

describe('schema (typed authoring layer)', () => {
    it('passes a valid typed schema through unchanged at runtime', () => {
        const schema: TypedSchema = [
            {
                type: 'textfield',
                id: 'name',
                layout: { row: 1, xs: 12, sm: 6 },
                props: {
                    id: 'name',
                    value: '',
                    MuiAttributes: { label: 'Full name', placeholder: 'Jane Doe' },
                },
                rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
            },
            {
                type: 'select',
                id: 'role',
                props: {
                    id: 'role',
                    value: '',
                    options: [
                        { value: 'admin', label: 'Admin' },
                        { value: 'user', label: 'User' },
                    ],
                },
            },
            {
                type: 'chipselect',
                id: 'tags',
                props: {
                    id: 'tags',
                    label: 'Tags',
                    options: ['a', 'b', { value: 'c', label: 'C' }],
                    multiple: true,
                },
            },
            {
                type: 'computed',
                id: 'total',
                props: { id: 'total', formula: 'qty * price' },
                formula: 'qty * price',
            },
        ];

        const result = defineForm(schema);

        // Runtime passthrough: same array reference/content, no transformation.
        expect(result).toEqual(schema);
        expect(result).toBe(schema as unknown);
        expect(result).toHaveLength(4);
        expect(result[0].type).toBe('textfield');
    });

    it('accepts less-common types via the permissive catch-all variant', () => {
        const schema: TypedSchema = [
            { type: 'lineitemlist', id: 'items', props: { id: 'items', columns: [] } },
            { type: 'formwizard', id: 'wiz', props: { id: 'wiz', steps: [] } },
        ];

        expect(defineForm(schema)).toEqual(schema);
    });
});
