import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFormEngine } from './useFormEngine';

const schema: any[] = [
    { type: 'select', props: { id: 'plan', options: [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }] } },
    { type: 'numberfield', props: { id: 'seats', value: 1 }, visibleWhen: { field: 'plan', op: 'eq', value: 'pro' }, requiredWhen: { field: 'plan', op: 'eq', value: 'pro' } },
    { type: 'numberfield', props: { id: 'price', value: 10 } },
    { type: 'computed', props: { id: 'total' }, formula: 'seats * price' },
    {
        type: 'select',
        props: { id: 'addon' },
        dependsOn: 'plan',
        optionsMap: { free: [{ value: 'none', label: 'None' }], pro: [{ value: 'sso', label: 'SSO' }, { value: 'audit', label: 'Audit log' }] },
    },
];

describe('useFormEngine (headless)', () => {
    it('seeds values from schema defaults and exposes field state', () => {
        const { result } = renderHook(() => useFormEngine(schema));
        expect(result.current.values.price).toBe(10);
        expect(result.current.getFieldState('price')?.value).toBe(10);
        // `seats` is hidden until plan=pro.
        expect(result.current.getFieldState('seats')?.visible).toBe(false);
        expect(result.current.visibleFields.some((f) => f.id === 'seats')).toBe(false);
    });

    it('reacts to setValue: visibility, requiredness, dynamic options, and formula', () => {
        const { result } = renderHook(() => useFormEngine(schema));
        act(() => result.current.setValue('plan', 'pro'));

        // seats becomes visible + required
        const seats = result.current.getFieldState('seats');
        expect(seats?.visible).toBe(true);
        expect(seats?.required).toBe(true);
        // addon options now come from the "pro" branch
        expect(result.current.getFieldState('addon')?.options).toEqual([{ value: 'sso', label: 'SSO' }, { value: 'audit', label: 'Audit log' }]);
        // computed total = seats(1) * price(10)
        expect(result.current.getFieldState('total')?.value).toBe(10);

        act(() => result.current.setValue('seats', 3));
        expect(result.current.getFieldState('total')?.value).toBe(30);
    });

    it('validates required + resolver, and skips hidden fields', () => {
        const { result } = renderHook(() => useFormEngine(schema));
        // plan=free → seats hidden → its requiredWhen must NOT block.
        act(() => result.current.setValue('plan', 'free'));
        let errs: any[] = [];
        act(() => { errs = result.current.validate(); });
        expect(errs.some((e) => e.id === 'seats')).toBe(false);

        // plan=pro → seats required and empty → error surfaces.
        act(() => { result.current.setValue('plan', 'pro'); result.current.setValue('seats', ''); });
        act(() => { errs = result.current.validate(); });
        expect(errs.some((e) => e.id === 'seats')).toBe(true);
        expect(result.current.getFieldState('seats')?.error).toBeTruthy();
    });

    it('tracks dirty and resets', () => {
        const { result } = renderHook(() => useFormEngine(schema));
        expect(result.current.isDirty).toBe(false);
        act(() => result.current.setValue('price', 25));
        expect(result.current.isDirty).toBe(true);
        act(() => result.current.reset());
        expect(result.current.values.price).toBe(10);
        expect(result.current.isDirty).toBe(false);
    });

    it('submit calls onValid only when there are no errors', () => {
        const { result } = renderHook(() => useFormEngine(schema));
        let submitted: any = null;
        act(() => { result.current.setValue('plan', 'pro'); result.current.setValue('seats', 2); });
        act(() => { result.current.submit((v) => { submitted = v; }); });
        expect(submitted).toMatchObject({ plan: 'pro', seats: 2 });
    });
});
