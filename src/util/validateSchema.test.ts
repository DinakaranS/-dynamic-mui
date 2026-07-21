import { describe, it, expect } from 'vitest';
import { validateSchema } from './validateSchema';

describe('validateSchema', () => {
    it('returns [] for a clean schema', () => {
        const ok = [
            { type: 'textfield', props: { id: 'name' }, layout: { row: 1, xs: 12 } },
            { type: 'select', props: { id: 'country', options: [{ value: 'us', label: 'US' }] }, layout: { row: 2, xs: 12 } },
            { type: 'select', props: { id: 'state' }, dependsOn: 'country', optionsMap: { us: [{ value: 'ca', label: 'CA' }] }, layout: { row: 3, xs: 12 } },
        ];
        expect(validateSchema(ok as any)).toEqual([]);
    });

    it('flags duplicate ids among siblings', () => {
        const s = [
            { type: 'textfield', props: { id: 'name' } },
            { type: 'textfield', props: { id: 'name' } },
        ];
        const issues = validateSchema(s as any);
        expect(issues.some((i) => i.code === 'duplicate-id' && i.field === 'name' && i.level === 'error')).toBe(true);
    });

    it('flags dependsOn pointing at a missing field, and orphan optionsMap', () => {
        const s = [
            { type: 'select', props: { id: 'state' }, dependsOn: 'country', optionsMap: { us: [] } },
            { type: 'select', props: { id: 'city' }, optionsMap: { a: [] } }, // no dependsOn
        ];
        const issues = validateSchema(s as any);
        expect(issues.some((i) => i.code === 'unknown-depends-target' && i.field === 'state')).toBe(true);
        expect(issues.some((i) => i.code === 'options-without-depends' && i.field === 'city')).toBe(true);
    });

    it('flags rule conditions referencing non-existent fields', () => {
        const s = [
            { type: 'textfield', props: { id: 'reason' }, visibleWhen: { field: 'status', op: 'eq', value: 'other' } },
        ];
        const issues = validateSchema(s as any);
        expect(issues.some((i) => i.code === 'unknown-rule-field' && i.message.includes('status'))).toBe(true);
    });

    it('flags cross-field validators referencing non-existent fields', () => {
        const s = [
            { type: 'textfield', props: { id: 'confirm' }, rules: { validation: [{ rule: 'equalsField', field: 'password', message: 'x' }] } },
        ];
        const issues = validateSchema(s as any);
        expect(issues.some((i) => i.code === 'unknown-cross-field' && i.message.includes('password'))).toBe(true);
    });

    it('flags a subform conditionValue that is not one of the field options', () => {
        const s = [
            {
                type: 'select',
                props: { id: 'kind', options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
                subforms: [{ conditionValue: 'zzz', data: [{ type: 'textfield', props: { id: 'extra' } }] }],
            },
        ];
        const issues = validateSchema(s as any);
        expect(issues.some((i) => i.code === 'subform-condition-not-an-option' && i.field === 'kind')).toBe(true);
    });

    it('recurses into subform fields (a valid nested reference passes)', () => {
        const s = [
            {
                type: 'select',
                props: { id: 'kind', options: [{ value: 'a', label: 'A' }] },
                subforms: [{ conditionValue: 'a', data: [{ type: 'textfield', props: { id: 'detail' }, requiredWhen: { field: 'kind', op: 'eq', value: 'a' } }] }],
            },
        ];
        expect(validateSchema(s as any)).toEqual([]);
    });
});
