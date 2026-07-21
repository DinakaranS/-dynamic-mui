import { describe, it, expect } from 'vitest';
import Validation from './validation';

// Controls can validate schema-provided non-string values (a NumberField's
// numeric value, a Switch's boolean, an unset undefined). validator.js throws
// on non-strings, so every rule must coerce/guard and never throw out.
describe('validators are crash-safe on non-string input', () => {
    const nonStrings: any[] = [5, 0, -3.5, true, false, null, undefined, {}, [], NaN];
    const keys = Object.keys(Validation);

    it('no validator throws for any non-string value', () => {
        keys.forEach((rule) => {
            nonStrings.forEach((v) => {
                expect(() => Validation[rule](v)).not.toThrow();
            });
        });
    });

    it('numeric coerces a real number instead of throwing', () => {
        expect(Validation.numeric(123 as any)).toBe(true);
        expect(Validation.numeric('12.5')).toBe(true);
        expect(Validation.numeric('abc')).toBe(false);
    });

    it('boolean/email/url handle non-strings without throwing', () => {
        expect(() => Validation.boolean(true as any)).not.toThrow();
        expect(() => Validation.email(undefined as any)).not.toThrow();
        expect(() => Validation.url(42 as any)).not.toThrow();
    });

    it('mandatory still works (coerces booleans/numbers)', () => {
        expect(Validation.mandatory('' as any)).toBe(false);
        expect(Validation.mandatory('   ' as any)).toBe(false);
        expect(Validation.mandatory(false as any)).toBe(true); // a value is present
        expect(Validation.mandatory(0 as any)).toBe(true);
    });
});
