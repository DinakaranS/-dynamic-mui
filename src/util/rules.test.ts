import { describe, it, expect } from 'vitest';
import { evaluateRule, computeFormula, CROSS_FIELD_VALIDATORS } from './rules';

describe('evaluateRule', () => {
    it('returns true for an undefined rule', () => {
        expect(evaluateRule(undefined, {})).toBe(true);
    });

    it('defaults to eq when a value is given', () => {
        expect(evaluateRule({ field: 'a', value: 'x' }, { a: 'x' })).toBe(true);
        expect(evaluateRule({ field: 'a', value: 'x' }, { a: 'y' })).toBe(false);
    });

    it('defaults to truthy when no value is given', () => {
        expect(evaluateRule({ field: 'ok' }, { ok: true })).toBe(true);
        expect(evaluateRule({ field: 'ok' }, { ok: '' })).toBe(false);
        expect(evaluateRule({ field: 'ok' }, {})).toBe(false);
    });

    it('supports numeric comparisons', () => {
        expect(evaluateRule({ field: 'n', op: 'gt', value: 5 }, { n: 10 })).toBe(true);
        expect(evaluateRule({ field: 'n', op: 'lte', value: 5 }, { n: 5 })).toBe(true);
        expect(evaluateRule({ field: 'n', op: 'gt', value: 5 }, { n: '3' })).toBe(false);
    });

    it('supports in / nin / contains', () => {
        expect(evaluateRule({ field: 'c', op: 'in', value: ['a', 'b'] }, { c: 'b' })).toBe(true);
        expect(evaluateRule({ field: 'c', op: 'nin', value: ['a', 'b'] }, { c: 'z' })).toBe(true);
        expect(evaluateRule({ field: 'tags', op: 'contains', value: 'x' }, { tags: ['x', 'y'] })).toBe(true);
        expect(evaluateRule({ field: 's', op: 'contains', value: 'ell' }, { s: 'hello' })).toBe(true);
    });

    it('supports empty / notEmpty', () => {
        expect(evaluateRule({ field: 'v', op: 'empty' }, { v: '' })).toBe(true);
        expect(evaluateRule({ field: 'v', op: 'empty' }, { v: [] })).toBe(true);
        expect(evaluateRule({ field: 'v', op: 'notEmpty' }, { v: 'x' })).toBe(true);
    });

    it('evaluates AND / OR / NOR groups', () => {
        const values = { a: 'yes', n: 10 };
        expect(evaluateRule({ all: [{ field: 'a', value: 'yes' }, { field: 'n', op: 'gt', value: 5 }] }, values)).toBe(true);
        expect(evaluateRule({ all: [{ field: 'a', value: 'no' }, { field: 'n', op: 'gt', value: 5 }] }, values)).toBe(false);
        expect(evaluateRule({ any: [{ field: 'a', value: 'no' }, { field: 'n', op: 'gt', value: 5 }] }, values)).toBe(true);
        expect(evaluateRule({ none: [{ field: 'a', value: 'no' }] }, values)).toBe(true);
        expect(evaluateRule({ none: [{ field: 'a', value: 'yes' }] }, values)).toBe(false);
    });

    it('nests groups', () => {
        const expr = { all: [{ field: 'x', value: '1' }, { any: [{ field: 'y', value: '2' }, { field: 'z', value: '3' }] }] };
        expect(evaluateRule(expr, { x: '1', z: '3' })).toBe(true);
        expect(evaluateRule(expr, { x: '1', y: '9', z: '9' })).toBe(false);
    });
});

describe('computeFormula', () => {
    it('evaluates arithmetic with field references', () => {
        expect(computeFormula('qty * price', { qty: 3, price: 4 })).toBe(12);
        expect(computeFormula('a + b - c', { a: 10, b: 5, c: 2 })).toBe(13);
        expect(computeFormula('(a + b) / 2', { a: 4, b: 6 })).toBe(5);
    });

    it('treats missing / non-numeric fields as 0', () => {
        expect(computeFormula('a + b', { a: 5 })).toBe(5);
        expect(computeFormula('a * 2', { a: 'nope' })).toBe(0);
    });

    it('coerces numeric strings (e.g. currency output)', () => {
        expect(computeFormula('price * 1.1', { price: '100.00' })).toBeCloseTo(110);
    });

    it('supports functions', () => {
        expect(computeFormula('SUM(a, b, c)', { a: 1, b: 2, c: 3 })).toBe(6);
        expect(computeFormula('MAX(a, b)', { a: 7, b: 3 })).toBe(7);
        expect(computeFormula('ROUND(x, 2)', { x: 3.14159 })).toBe(3.14);
        expect(computeFormula('ABS(x)', { x: -8 })).toBe(8);
    });

    it('handles unary minus and division by zero safely', () => {
        expect(computeFormula('-a + 10', { a: 3 })).toBe(7);
        expect(computeFormula('a / b', { a: 5, b: 0 })).toBe(0);
    });

    it('returns "" for invalid formulas instead of throwing', () => {
        expect(computeFormula('a +', { a: 1 })).toBe('');
        expect(computeFormula('a @ b', { a: 1, b: 2 })).toBe('');
        expect(computeFormula('', {})).toBe('');
    });
});

describe('CROSS_FIELD_VALIDATORS', () => {
    it('compares two field values', () => {
        expect(CROSS_FIELD_VALIDATORS.equalsField('secret', 'secret')).toBe(true);
        expect(CROSS_FIELD_VALIDATORS.equalsField('a', 'b')).toBe(false);
        expect(CROSS_FIELD_VALIDATORS.gteField('10', '5')).toBe(true);
        expect(CROSS_FIELD_VALIDATORS.ltField('3', '5')).toBe(true);
    });
});
