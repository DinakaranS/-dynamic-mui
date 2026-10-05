/**
 * Adversarial deep tests for the dynamic-form rule engine (src/util/rules.ts).
 *
 * Every assertion here documents the ACTUAL behaviour of evaluateRule /
 * computeFormula / CROSS_FIELD_VALIDATORS. Where the actual behaviour is a
 * genuine logic bug, the test is `it.skip('BUG: ...')` with a `// BUG:` note so
 * the suite stays green while flagging the defect.
 */
import { describe, it, expect } from 'vitest';
import {
    evaluateRule,
    computeFormula,
    CROSS_FIELD_VALIDATORS,
    type RuleExpr,
} from './rules';

// -------------------------------------------------------------------------
// evaluateRule — structural / missing-input edge cases
// -------------------------------------------------------------------------
describe('evaluateRule: structural edges', () => {
    it('undefined expr is vacuously true', () => {
        expect(evaluateRule(undefined, {})).toBe(true);
    });

    it('null expr (falsy) is vacuously true', () => {
        expect(evaluateRule(null as unknown as RuleExpr, {})).toBe(true);
    });

    it('empty condition object {} (no field) is true', () => {
        expect(evaluateRule({} as RuleExpr, {})).toBe(true);
    });

    it('condition missing field is true regardless of op/value', () => {
        expect(evaluateRule({ op: 'eq', value: 5 } as RuleExpr, { a: 1 })).toBe(true);
    });

    it('empty-string field is treated as missing → true', () => {
        expect(evaluateRule({ field: '', op: 'eq', value: 5 }, { '': 5 })).toBe(true);
    });

    it('a non-array all/any/none is NOT a group → treated as condition (field undefined → true)', () => {
        expect(evaluateRule({ all: 'nope' } as unknown as RuleExpr, {})).toBe(true);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — eq / neq coercion
// -------------------------------------------------------------------------
describe('evaluateRule: eq/neq coercion', () => {
    it('eq coerces number-vs-string ("5" === 5)', () => {
        expect(evaluateRule({ field: 'a', op: 'eq', value: 5 }, { a: '5' })).toBe(true);
    });

    it('eq(0, false) is false (String("0") !== String(false))', () => {
        expect(evaluateRule({ field: 'a', op: 'eq', value: false }, { a: 0 })).toBe(false);
    });

    it('eq(null, undefined) is false via string coercion', () => {
        expect(evaluateRule({ field: 'a', op: 'eq', value: undefined }, { a: null })).toBe(false);
    });

    it('ADVERSARIAL: eq(NaN, NaN) is TRUE because String(NaN) === "NaN"', () => {
        expect(evaluateRule({ field: 'a', op: 'eq', value: NaN }, { a: NaN })).toBe(true);
    });

    it('neq is the strict inverse of eq', () => {
        expect(evaluateRule({ field: 'a', op: 'neq', value: 5 }, { a: '5' })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'neq', value: 6 }, { a: '5' })).toBe(true);
    });

    it('eq does NOT collapse distinct objects to "[object Object]"', () => {
        // Two different object references must not be treated as loosely-equal.
        expect(evaluateRule({ field: 'a', op: 'eq', value: {} }, { a: {} })).toBe(false);
        // The same reference is still equal.
        const shared = { x: 1 };
        expect(evaluateRule({ field: 'a', op: 'eq', value: shared }, { a: shared })).toBe(true);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — numeric comparisons
// -------------------------------------------------------------------------
describe('evaluateRule: gt/gte/lt/lte', () => {
    it('gt coerces numeric strings ("5" > 3)', () => {
        expect(evaluateRule({ field: 'a', op: 'gt', value: 3 }, { a: '5' })).toBe(true);
    });

    it('ADVERSARIAL: gt compares numerically, not lexically ("5" > 10 is false)', () => {
        expect(evaluateRule({ field: 'a', op: 'gt', value: 10 }, { a: '5' })).toBe(false);
    });

    it('gt with non-numeric actual → NaN comparison is false', () => {
        expect(evaluateRule({ field: 'a', op: 'gt', value: 1 }, { a: 'abc' })).toBe(false);
    });

    it('ADVERSARIAL: gte on equal NON-numeric strings is FALSE (NaN >= NaN)', () => {
        // eq('a','a') would be true, but gte goes numeric → NaN >= NaN → false
        expect(evaluateRule({ field: 'a', op: 'gte', value: 'a' }, { a: 'a' })).toBe(false);
    });

    it('gte/lte accept equality on numeric strings', () => {
        expect(evaluateRule({ field: 'a', op: 'gte', value: '5' }, { a: 5 })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'lte', value: '5' }, { a: 5 })).toBe(true);
    });

    it('lt basic', () => {
        expect(evaluateRule({ field: 'a', op: 'lt', value: 10 }, { a: 3 })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'lt', value: 3 }, { a: 3 })).toBe(false);
    });

    it('gt against undefined actual → NaN → false', () => {
        expect(evaluateRule({ field: 'a', op: 'gt', value: 0 }, {})).toBe(false);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — in / nin
// -------------------------------------------------------------------------
describe('evaluateRule: in/nin', () => {
    it('in matches with string coercion of members', () => {
        expect(evaluateRule({ field: 'a', op: 'in', value: [1, 2, '3'] }, { a: 3 })).toBe(true);
    });

    it('in with non-array value is false (nothing is in a non-list)', () => {
        expect(evaluateRule({ field: 'a', op: 'in', value: 'abc' }, { a: 'a' })).toBe(false);
    });

    it('nin: value not present → true', () => {
        expect(evaluateRule({ field: 'a', op: 'nin', value: [1, 2] }, { a: 3 })).toBe(true);
    });

    it('nin: value present → false', () => {
        expect(evaluateRule({ field: 'a', op: 'nin', value: [1, 2] }, { a: 2 })).toBe(false);
    });

    it('nin with a non-array value is vacuously true (fixed)', () => {
        // Regression: `nin` is the negation of `in`; with no list to be "in" it is
        // vacuously TRUE. (Previously short-circuited to false — failed closed.)
        expect(evaluateRule({ field: 'a', op: 'nin', value: 'xyz' }, { a: 'a' })).toBe(true);
        // sanity: real not-in list still works
        expect(evaluateRule({ field: 'a', op: 'nin', value: ['x', 'y'] }, { a: 'a' })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'nin', value: ['a', 'y'] }, { a: 'a' })).toBe(false);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — contains / startsWith / endsWith
// -------------------------------------------------------------------------
describe('evaluateRule: contains/startsWith/endsWith', () => {
    it('contains substring in string', () => {
        expect(evaluateRule({ field: 'a', op: 'contains', value: 'ell' }, { a: 'hello' })).toBe(true);
    });

    it('contains element in array (string-coerced)', () => {
        expect(evaluateRule({ field: 'a', op: 'contains', value: 2 }, { a: [1, 2, 3] })).toBe(true);
    });

    it('contains on a number coerces to its string form', () => {
        expect(evaluateRule({ field: 'a', op: 'contains', value: 2 }, { a: 123 })).toBe(true);
    });

    it('contains on undefined actual → "".includes(x) → false', () => {
        expect(evaluateRule({ field: 'a', op: 'contains', value: 'x' }, {})).toBe(false);
    });

    it('ADVERSARIAL: contains with empty-string needle is always true (even for missing value)', () => {
        expect(evaluateRule({ field: 'a', op: 'contains', value: '' }, { a: 'hello' })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'contains', value: '' }, {})).toBe(true);
    });

    it('startsWith coerces numeric actual to string', () => {
        expect(evaluateRule({ field: 'a', op: 'startsWith', value: '12' }, { a: 12345 })).toBe(true);
    });

    it('endsWith basic + null-safe', () => {
        expect(evaluateRule({ field: 'a', op: 'endsWith', value: 'lo' }, { a: 'hello' })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'endsWith', value: 'lo' }, {})).toBe(false);
    });

    it('ADVERSARIAL: leading/trailing whitespace is significant', () => {
        expect(evaluateRule({ field: 'a', op: 'eq', value: 'hello' }, { a: ' hello ' })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'startsWith', value: 'hello' }, { a: ' hello' })).toBe(false);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — empty / notEmpty / truthy / falsy on present-but-falsy
// -------------------------------------------------------------------------
describe('evaluateRule: empty/notEmpty/truthy/falsy', () => {
    it('empty is true for null/""/[]/{}', () => {
        for (const v of [null, undefined, '', [], {}]) {
            expect(evaluateRule({ field: 'a', op: 'empty' }, { a: v })).toBe(true);
        }
    });

    it('ADVERSARIAL: 0 and false are NOT empty', () => {
        expect(evaluateRule({ field: 'a', op: 'empty' }, { a: 0 })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'empty' }, { a: false })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'notEmpty' }, { a: 0 })).toBe(true);
    });

    it('truthy: 0 → false, "0" → true, [] → false, "false" → true', () => {
        expect(evaluateRule({ field: 'a', op: 'truthy' }, { a: 0 })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'truthy' }, { a: '0' })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'truthy' }, { a: [] })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'truthy' }, { a: 'false' })).toBe(true);
    });

    it('falsy: 0 → true, [] → true, "0" → false, false → true', () => {
        expect(evaluateRule({ field: 'a', op: 'falsy' }, { a: 0 })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'falsy' }, { a: [] })).toBe(true);
        expect(evaluateRule({ field: 'a', op: 'falsy' }, { a: '0' })).toBe(false);
        expect(evaluateRule({ field: 'a', op: 'falsy' }, { a: false })).toBe(true);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — default operator inference
// -------------------------------------------------------------------------
describe('evaluateRule: default op inference', () => {
    it('op omitted + value present → eq', () => {
        expect(evaluateRule({ field: 'a', value: 'x' }, { a: 'x' })).toBe(true);
        expect(evaluateRule({ field: 'a', value: 'x' }, { a: 'y' })).toBe(false);
    });

    it('op omitted + no value → truthy', () => {
        expect(evaluateRule({ field: 'a' }, { a: 1 })).toBe(true);
        expect(evaluateRule({ field: 'a' }, { a: 0 })).toBe(false);
    });

    it('ADVERSARIAL: op omitted + value:0 → eq(actual, 0), not truthy', () => {
        expect(evaluateRule({ field: 'a', value: 0 }, { a: 0 })).toBe(true);
        expect(evaluateRule({ field: 'a', value: 0 }, { a: '0' })).toBe(true);
        expect(evaluateRule({ field: 'a', value: 0 }, { a: false })).toBe(false);
    });

    it('op omitted + explicit value:undefined → truthy', () => {
        expect(evaluateRule({ field: 'a', value: undefined }, { a: 5 })).toBe(true);
        expect(evaluateRule({ field: 'a', value: undefined }, { a: 0 })).toBe(false);
    });

    it('unknown operator falls through to false', () => {
        expect(evaluateRule({ field: 'a', op: 'bogus' as never, value: 1 }, { a: 1 })).toBe(false);
    });
});

// -------------------------------------------------------------------------
// evaluateRule — groups (all/any/none), empties, deep nesting
// -------------------------------------------------------------------------
describe('evaluateRule: groups & nesting', () => {
    const T: RuleExpr = { field: 'a', op: 'eq', value: 1 }; // true when a===1
    const F: RuleExpr = { field: 'a', op: 'eq', value: 2 }; // false when a===1
    const vals = { a: 1 };

    it('all: AND', () => {
        expect(evaluateRule({ all: [T, T] }, vals)).toBe(true);
        expect(evaluateRule({ all: [T, F] }, vals)).toBe(false);
    });

    it('any: OR', () => {
        expect(evaluateRule({ any: [F, T] }, vals)).toBe(true);
        expect(evaluateRule({ any: [F, F] }, vals)).toBe(false);
    });

    it('none: NOR', () => {
        expect(evaluateRule({ none: [F, F] }, vals)).toBe(true);
        expect(evaluateRule({ none: [F, T] }, vals)).toBe(false);
    });

    it('ADVERSARIAL: empty {all:[]} is true (AND identity)', () => {
        expect(evaluateRule({ all: [] }, vals)).toBe(true);
    });

    it('ADVERSARIAL: empty {any:[]} is FALSE (OR identity)', () => {
        expect(evaluateRule({ any: [] }, vals)).toBe(false);
    });

    it('ADVERSARIAL: empty {none:[]} is true (NOR identity)', () => {
        expect(evaluateRule({ none: [] }, vals)).toBe(true);
    });

    it('combined all+any+none in one group ANDs the three verdicts', () => {
        expect(evaluateRule({ all: [T], any: [F, T], none: [F] }, vals)).toBe(true);
        // any:[] short-circuits the whole group to false
        expect(evaluateRule({ all: [T], any: [], none: [F] }, vals)).toBe(false);
    });

    it('deeply nested 4-level mix', () => {
        const expr: RuleExpr = {
            all: [
                { any: [F, { all: [T, { none: [F] }] }] },
                { none: [{ any: [F, F] }] },
            ],
        };
        expect(evaluateRule(expr, vals)).toBe(true);
    });

    it('nested group flips to false when a leaf fails', () => {
        const expr: RuleExpr = { all: [{ any: [F, { all: [T, F] }] }] };
        expect(evaluateRule(expr, vals)).toBe(false);
    });
});

// -------------------------------------------------------------------------
// computeFormula — invalid / non-string input
// -------------------------------------------------------------------------
describe('computeFormula: invalid input → ""', () => {
    it('empty string', () => expect(computeFormula('', {})).toBe(''));
    it('whitespace only', () => expect(computeFormula('   \t\n', {})).toBe(''));
    it('non-string number', () => expect(computeFormula(5 as unknown as string, {})).toBe(''));
    it('null', () => expect(computeFormula(null as unknown as string, {})).toBe(''));
    it('undefined', () => expect(computeFormula(undefined as unknown as string, {})).toBe(''));
});

// -------------------------------------------------------------------------
// computeFormula — arithmetic, precedence, unary
// -------------------------------------------------------------------------
describe('computeFormula: arithmetic & precedence', () => {
    it('2+3 = 5', () => expect(computeFormula('2+3', {})).toBe(5));
    it('precedence 2+3*4 = 14', () => expect(computeFormula('2+3*4', {})).toBe(14));
    it('parens (2+3)*4 = 20', () => expect(computeFormula('(2+3)*4', {})).toBe(20));
    it('left-assoc subtraction 2-3-4 = -5', () => expect(computeFormula('2-3-4', {})).toBe(-5));
    it('left-assoc division 10/2/5 = 1', () => expect(computeFormula('10/2/5', {})).toBe(1));
    it('modulo precedence 2+10%3 = 3', () => expect(computeFormula('2+10%3', {})).toBe(3));
    it('nested parens ((1+2))*3 = 9', () => expect(computeFormula('((1+2))*3', {})).toBe(9));
    it('surrounding whitespace tolerated', () => expect(computeFormula('  2 + 3 ', {})).toBe(5));

    it('unary minus -5', () => expect(computeFormula('-5', {})).toBe(-5));
    it('unary plus +5', () => expect(computeFormula('+5', {})).toBe(5));
    it('unary over parens -(2+3) = -5', () => expect(computeFormula('-(2+3)', {})).toBe(-5));
    it('double unary - -5 = 5', () => expect(computeFormula('- -5', {})).toBe(5));
    it('subtract a negative 2 - -3 = 5', () => expect(computeFormula('2 - -3', {})).toBe(5));
    it('unary binds under multiply -2*3 = -6', () => expect(computeFormula('-2*3', {})).toBe(-6));
});

// -------------------------------------------------------------------------
// computeFormula — division / modulo by zero (guarded → 0)
// -------------------------------------------------------------------------
describe('computeFormula: divide/modulo by zero → 0', () => {
    it('5/0 = 0 (not Infinity)', () => expect(computeFormula('5/0', {})).toBe(0));
    it('0/0 = 0 (not NaN)', () => expect(computeFormula('0/0', {})).toBe(0));
    it('5%0 = 0 (not NaN)', () => expect(computeFormula('5%0', {})).toBe(0));
    it('divide by zero-valued field = 0', () =>
        expect(computeFormula('a/b', { a: 5, b: 0 })).toBe(0));
    it('normal modulo 10%3 = 1', () => expect(computeFormula('10%3', {})).toBe(1));
    it('float modulo 5.5%2 = 1.5', () => expect(computeFormula('5.5%2', {})).toBe(1.5));
});

// -------------------------------------------------------------------------
// computeFormula — functions
// -------------------------------------------------------------------------
describe('computeFormula: functions', () => {
    it('SUM(1,2,3) = 6', () => expect(computeFormula('SUM(1,2,3)', {})).toBe(6));
    it('ADVERSARIAL: SUM() = 0', () => expect(computeFormula('SUM()', {})).toBe(0));
    it('AVG(2,4) = 3', () => expect(computeFormula('AVG(2,4)', {})).toBe(3));
    it('ADVERSARIAL: AVG() = 0 (no divide-by-zero)', () => expect(computeFormula('AVG()', {})).toBe(0));
    it('MIN(3,1,2) = 1', () => expect(computeFormula('MIN(3,1,2)', {})).toBe(1));
    it('MAX(3,1,2) = 3', () => expect(computeFormula('MAX(3,1,2)', {})).toBe(3));
    it('ADVERSARIAL: MIN()/MAX() = 0 (not Infinity)', () => {
        expect(computeFormula('MIN()', {})).toBe(0);
        expect(computeFormula('MAX()', {})).toBe(0);
    });
    it('ROUND(2.7) = 3', () => expect(computeFormula('ROUND(2.7)', {})).toBe(3));
    it('ADVERSARIAL: ROUND(-2.5) = -2 (JS rounds .5 toward +Inf)', () =>
        expect(computeFormula('ROUND(-2.5)', {})).toBe(-2));
    it('ROUND(2.345,2) = 2.35 (half-up via scaled Math.round)', () =>
        expect(computeFormula('ROUND(2.345,2)', {})).toBe(2.35));
    it('ABS(-5) = 5', () => expect(computeFormula('ABS(-5)', {})).toBe(5));
    it('FLOOR(2.9) = 2', () => expect(computeFormula('FLOOR(2.9)', {})).toBe(2));
    it('CEIL(2.1) = 3', () => expect(computeFormula('CEIL(2.1)', {})).toBe(3));

    it('nested ROUND(AVG(2,3),1) = 2.5', () =>
        expect(computeFormula('ROUND(AVG(2,3),1)', {})).toBe(2.5));
    it('nested MAX(MIN(1,5),MIN(2,3)) = 2', () =>
        expect(computeFormula('MAX(MIN(1,5),MIN(2,3))', {})).toBe(2));

    it('function names are case-insensitive', () => {
        expect(computeFormula('sum(1,2)', {})).toBe(3);
        expect(computeFormula('Round(2.5)', {})).toBe(3);
    });

    it('unknown function → ""', () => expect(computeFormula('FOO(1)', {})).toBe(''));

    it('missing args resolve to 0 inside functions', () =>
        expect(computeFormula('SUM(a,b,c)', { a: 1, b: 2 })).toBe(3));
});

// -------------------------------------------------------------------------
// computeFormula — field references
// -------------------------------------------------------------------------
describe('computeFormula: field refs', () => {
    it('resolves fields', () => expect(computeFormula('a+b', { a: 2, b: 3 })).toBe(5));
    it('missing field → 0', () => expect(computeFormula('a+b', { a: 2 })).toBe(2));
    it('unknown identifier alone → 0', () => expect(computeFormula('x', {})).toBe(0));
    it('numeric-string field "12.50" → 12.5', () =>
        expect(computeFormula('a*2', { a: '12.50' })).toBe(25));
    it('ADVERSARIAL: unit-suffixed field "5px" → parseFloat → 5', () =>
        expect(computeFormula('a+1', { a: '5px' })).toBe(6));
    it('ADVERSARIAL: dotted field name is a literal key, not a nested path', () =>
        expect(computeFormula('a.b + 1', { 'a.b': 5 })).toBe(6));
    it('boolean field → NaN → 0', () => expect(computeFormula('a+1', { a: true })).toBe(1));
});

// -------------------------------------------------------------------------
// computeFormula — malformed input → ""
// -------------------------------------------------------------------------
describe('computeFormula: malformed → ""', () => {
    it('trailing operator "2+"', () => expect(computeFormula('2+', {})).toBe(''));
    it('leading operator "*5"', () => expect(computeFormula('*5', {})).toBe(''));
    it('unbalanced open "(2+3"', () => expect(computeFormula('(2+3', {})).toBe(''));
    it('extra close "2+3)"', () => expect(computeFormula('2+3)', {})).toBe(''));
    it('empty parens "()"', () => expect(computeFormula('()', {})).toBe(''));
    it('two adjacent numbers "2 3"', () => expect(computeFormula('2 3', {})).toBe(''));
    it('adjacent factor "2(3)"', () => expect(computeFormula('2(3)', {})).toBe(''));
    it('ADVERSARIAL: leading dot ".5" → unexpected char → ""', () =>
        expect(computeFormula('.5', {})).toBe(''));
    it('ADVERSARIAL: scientific notation "1e2" is not parsed → ""', () =>
        expect(computeFormula('1e2', {})).toBe(''));
    it('unexpected character "2 & 3"', () => expect(computeFormula('2 & 3', {})).toBe(''));
    it('missing comma / two exprs in call "SUM(1 2)"', () =>
        expect(computeFormula('SUM(1 2)', {})).toBe(''));
});

// -------------------------------------------------------------------------
// computeFormula — number tokenizer quirks & overflow
// -------------------------------------------------------------------------
describe('computeFormula: number quirks', () => {
    it('ADVERSARIAL: multi-dot "1.2.3" → parseFloat → 1.2', () =>
        expect(computeFormula('1.2.3', {})).toBe(1.2));
    it('trailing dot "5." → 5', () => expect(computeFormula('5.+1', {})).toBe(6));
    it('negative decimal -2.5*2 = -5', () => expect(computeFormula('-2.5*2', {})).toBe(-5));
    it('ADVERSARIAL: overflow to Infinity → ""', () =>
        expect(computeFormula('9'.repeat(400), {})).toBe(''));
    it('large-but-finite product stays numeric', () =>
        expect(computeFormula('1000000 * 1000000', {})).toBe(1e12));
});

// -------------------------------------------------------------------------
// CROSS_FIELD_VALIDATORS
// -------------------------------------------------------------------------
describe('CROSS_FIELD_VALIDATORS', () => {
    const V = CROSS_FIELD_VALIDATORS;

    it('equalsField is strict string equality', () => {
        expect(V.equalsField('5', '5')).toBe(true);
        expect(V.equalsField('', '')).toBe(true);
    });

    it('ADVERSARIAL: equalsField("5","5.0") is false (no numeric coercion)', () => {
        expect(V.equalsField('5', '5.0')).toBe(false);
    });

    it('notEqualsField', () => {
        expect(V.notEqualsField('a', 'b')).toBe(true);
        expect(V.notEqualsField('a', 'a')).toBe(false);
    });

    it('gtField / ltField coerce numerically', () => {
        expect(V.gtField('10', '9')).toBe(true);
        expect(V.gtField('9', '10')).toBe(false);
        expect(V.ltField('3', '10')).toBe(true);
    });

    it('ADVERSARIAL: gtField uses parseFloat prefix ("9abc" → 9)', () => {
        expect(V.gtField('10', '9abc')).toBe(true);
    });

    it('gtField with non-numeric operand → NaN comparison → false', () => {
        expect(V.gtField('abc', '1')).toBe(false);
    });

    it('gteField / lteField equality on numeric strings', () => {
        expect(V.gteField('5', '5')).toBe(true);
        expect(V.lteField('5', '5')).toBe(true);
    });

    it('ADVERSARIAL: gteField("","0") is false (NaN >= 0)', () => {
        expect(V.gteField('', '0')).toBe(false);
    });

    it('ADVERSARIAL: gtField("2.5","2.50") is false (equal after coercion)', () => {
        expect(V.gtField('2.5', '2.50')).toBe(false);
    });
});
