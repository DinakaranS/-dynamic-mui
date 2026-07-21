import { describe, it, expect } from 'vitest';
import { zodResolver, yupResolver } from './resolvers';

// Duck-typed fakes standing in for real zod / yup schemas — proves the resolvers
// never depend on the libraries themselves.

describe('zodResolver', () => {
    const fakeZod = {
        safeParse: (v: Record<string, any>) => {
            const issues: any[] = [];
            if (!v.email || !String(v.email).includes('@')) issues.push({ path: ['email'], message: 'Invalid email', code: 'invalid_string' });
            if ((v.age ?? 0) < 18) issues.push({ path: ['age'], message: 'Must be 18+', code: 'too_small' });
            return issues.length ? { success: false, error: { issues } } : { success: true, data: v };
        },
    };

    it('returns [] when the schema passes', () => {
        expect(zodResolver(fakeZod)({ email: 'a@b.com', age: 20 })).toEqual([]);
    });

    it('maps each issue to { id, message, rule } by the first path segment', () => {
        const errs = zodResolver(fakeZod)({ email: 'nope', age: 10 });
        expect(errs).toEqual([
            { id: 'email', message: 'Invalid email', rule: 'invalid_string' },
            { id: 'age', message: 'Must be 18+', rule: 'too_small' },
        ]);
    });
});

describe('yupResolver', () => {
    const fakeYup = {
        validateSync: (v: Record<string, any>) => {
            const inner: any[] = [];
            if (!v.name) inner.push({ path: 'name', message: 'Name is required', type: 'required' });
            if (inner.length) {
                const err: any = new Error('ValidationError');
                err.inner = inner;
                throw err;
            }
            return v;
        },
    };

    it('returns [] when the schema passes', () => {
        expect(yupResolver(fakeYup)({ name: 'Ada' })).toEqual([]);
    });

    it('collects errors from err.inner (abortEarly: false)', () => {
        expect(yupResolver(fakeYup)({})).toEqual([{ id: 'name', message: 'Name is required', rule: 'required' }]);
    });
});
