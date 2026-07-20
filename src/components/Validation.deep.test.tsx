import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Validation from '../util/validation';
import { FormGenerator, ClearFormData } from './FormGenerator';

/**
 * ADVERSARIAL DEEP TEST of dynamic-mui validation.
 *
 * Part 1 exercises every validator in `src/util/validation.ts` directly with
 * valid / invalid / edge inputs, asserting the ACTUAL observed behaviour
 * (validator@13.15.x, numeral@2.0.6). Where the actual behaviour is a genuine
 * defect, the correct-behaviour assertion is captured in an `it.skip('BUG: …')`
 * so the suite stays green while documenting the bug.
 *
 * Part 2 drives `getErrors` through FormGenerator's hidden submit button and
 * inspects `onSubmit.mock.calls[0][1]` (the errors array).
 */

// -------------------------------------------------------------------------
// Part 1 — validation.ts validators, called directly
// -------------------------------------------------------------------------
describe('validation.ts — direct validator behaviour', () => {
    describe('email', () => {
        it('accepts ordinary + tagged addresses', () => {
            expect(Validation.email('a@b.com')).toBe(true);
            expect(Validation.email('foo+bar@sub.example.co')).toBe(true);
        });
        it('rejects malformed / bare-domain / empty', () => {
            expect(Validation.email('a@b')).toBe(false);
            expect(Validation.email('nope')).toBe(false);
            expect(Validation.email('')).toBe(false);
            expect(Validation.email('  ')).toBe(false);
        });
    });

    describe('equals', () => {
        it('is an exact string comparison', () => {
            expect(Validation.equals('abc', 'abc')).toBe(true);
            expect(Validation.equals('abc', 'abcd')).toBe(false);
            expect(Validation.equals('', '')).toBe(true);
            // case sensitive
            expect(Validation.equals('ABC', 'abc')).toBe(false);
        });
    });

    describe('mandatory', () => {
        it('true for any non-empty string, false for empty', () => {
            expect(Validation.mandatory('x')).toBe(true);
            expect(Validation.mandatory('0')).toBe(true);
            expect(Validation.mandatory('')).toBe(false);
        });
        // FIXED: whitespace-only now fails mandatory (ignore_whitespace).
        it('whitespace-only fails mandatory (fixed)', () => {
            expect(Validation.mandatory('   ')).toBe(false);
            expect(Validation.mandatory('\t')).toBe(false);
        });
        // FIXED: non-string input is coerced instead of throwing.
        it('coerces non-string input instead of throwing (fixed)', () => {
            expect(() => Validation.mandatory(false as any)).not.toThrow();
            expect(Validation.mandatory(false as any)).toBe(true); // String(false) = 'false'
            expect(Validation.mandatory(0 as any)).toBe(true); // String(0) = '0'
        });
    });

    describe('mandatoryselect', () => {
        it('length-based: non-empty string / array pass, empty fail', () => {
            expect(Validation.mandatoryselect('x')).toBe(true);
            expect(Validation.mandatoryselect(['x'] as any)).toBe(true);
            expect(Validation.mandatoryselect('')).toBe(false);
            expect(Validation.mandatoryselect([] as any)).toBe(false);
        });
        // FIXED: nullish selection returns false instead of throwing.
        it('returns false for null/undefined instead of throwing (fixed)', () => {
            expect(() => Validation.mandatoryselect(null as any)).not.toThrow();
            expect(Validation.mandatoryselect(null as any)).toBe(false);
            expect(Validation.mandatoryselect(undefined as any)).toBe(false);
        });
    });

    describe('mobile', () => {
        it('valid E.164 passes, junk fails', () => {
            expect(Validation.mobile('+14155552671')).toBe(true);
            expect(Validation.mobile('abc')).toBe(false);
            expect(Validation.mobile('1234')).toBe(false);
        });
    });

    describe('length', () => {
        it('honours {min,max} bounds', () => {
            expect(Validation.length('abc', { min: 2, max: 5 })).toBe(true);
            expect(Validation.length('a', { min: 2, max: 5 })).toBe(false);
            expect(Validation.length('abcdef', { min: 2, max: 5 })).toBe(false);
            // boundary values are inclusive
            expect(Validation.length('ab', { min: 2, max: 5 })).toBe(true);
            expect(Validation.length('abcde', { min: 2, max: 5 })).toBe(true);
        });
        it('no options → any length (incl. empty) passes', () => {
            expect(Validation.length('')).toBe(true);
            expect(Validation.length('anything')).toBe(true);
        });
    });

    describe('url', () => {
        it('accepts http(s) and bare domains, rejects plain words', () => {
            expect(Validation.url('https://example.com')).toBe(true);
            expect(Validation.url('example.com')).toBe(true);
            expect(Validation.url('notaurl')).toBe(false);
            expect(Validation.url('')).toBe(false);
        });
    });

    describe('numeric', () => {
        it('accepts integers/decimals with optional sign', () => {
            expect(Validation.numeric('123')).toBe(true);
            expect(Validation.numeric('-5')).toBe(true);
            expect(Validation.numeric('+5')).toBe(true);
            expect(Validation.numeric('1.5')).toBe(true);
        });
        it('rejects scientific notation, hex and non-numbers', () => {
            // isNumeric default does NOT allow "1e5" or "0x1"
            expect(Validation.numeric('1e5')).toBe(false);
            expect(Validation.numeric('0x1')).toBe(false);
            expect(Validation.numeric('abc')).toBe(false);
            expect(Validation.numeric('')).toBe(false);
        });
    });

    describe('int', () => {
        it('integers pass, decimals fail', () => {
            expect(Validation.int('5')).toBe(true);
            expect(Validation.int('-5')).toBe(true);
            expect(Validation.int('1.5')).toBe(false);
        });
        it('honours {min,max} options', () => {
            expect(Validation.int('5', { min: 1, max: 10 })).toBe(true);
            expect(Validation.int('50', { min: 1, max: 10 })).toBe(false);
            expect(Validation.int('0', { min: 1, max: 10 })).toBe(false);
        });
    });

    describe('float', () => {
        it('accepts decimals, rejects words', () => {
            expect(Validation.float('1.5')).toBe(true);
            expect(Validation.float('-2')).toBe(true);
            expect(Validation.float('abc')).toBe(false);
        });
        it('honours {min,max} options', () => {
            expect(Validation.float('1.5', { min: 0, max: 1 })).toBe(false);
            expect(Validation.float('0.5', { min: 0, max: 1 })).toBe(true);
        });
    });

    describe('matches', () => {
        it('accepts both a string pattern and a RegExp', () => {
            expect(Validation.matches('123', '^\\d+$')).toBe(true);
            expect(Validation.matches('12a', '^\\d+$')).toBe(false);
            expect(Validation.matches('123', /^\d+$/)).toBe(true);
            expect(Validation.matches('12a', /^\d+$/)).toBe(false);
        });
    });

    describe('alpha', () => {
        it('ASCII letters only by default', () => {
            expect(Validation.alpha('abc')).toBe(true);
            expect(Validation.alpha('abc123')).toBe(false);
            expect(Validation.alpha('')).toBe(false);
            // accented unicode is NOT alpha under the default (en-US) locale
            expect(Validation.alpha('abcé')).toBe(false);
        });
    });

    describe('alphanumeric', () => {
        it('letters+digits pass, spaces/symbols fail', () => {
            expect(Validation.alphanumeric('abc123')).toBe(true);
            expect(Validation.alphanumeric('abc 123')).toBe(false);
            expect(Validation.alphanumeric('abc-123')).toBe(false);
        });
    });

    describe('creditcard', () => {
        it('valid Luhn number passes, short number fails', () => {
            expect(Validation.creditcard('4111111111111111')).toBe(true);
            expect(Validation.creditcard('1234')).toBe(false);
        });
    });

    describe('currency', () => {
        it('accepts $-formatted amounts, rejects words', () => {
            expect(Validation.currency('$1,000.00')).toBe(true);
            expect(Validation.currency('1000.00')).toBe(true);
            expect(Validation.currency('abc')).toBe(false);
        });
    });

    describe('date', () => {
        it('accepts real dates, rejects impossible ones', () => {
            expect(Validation.date('2020-01-01')).toBe(true);
            expect(Validation.date('13/40/2020')).toBe(false);
            expect(Validation.date('not a date')).toBe(false);
        });
    });

    describe('ip', () => {
        it('validates v4 / v6, rejects out-of-range octets', () => {
            expect(Validation.ip('1.2.3.4')).toBe(true);
            expect(Validation.ip('999.1.1.1')).toBe(false);
            expect(Validation.ip('::1', 6)).toBe(true);
            expect(Validation.ip('1.2.3.4', 6)).toBe(false);
        });
    });

    describe('boolean', () => {
        it('accepts "true"/"false", rejects "yes"', () => {
            expect(Validation.boolean('true')).toBe(true);
            expect(Validation.boolean('false')).toBe(true);
            expect(Validation.boolean('yes')).toBe(false);
        });
    });

    // The `negative` validator is numeral-based and mis-named: it returns
    // `(numeral(value).value() || 0) > -1`, i.e. TRUE for anything greater than
    // -1 (so it actually behaves like "is NOT less-than-or-equal to -1").
    describe('negative (numeral-based, mis-named)', () => {
        it('ACTUAL: true for values > -1, false for values <= -1', () => {
            expect(Validation.negative('5')).toBe(true);
            expect(Validation.negative('0')).toBe(true);
            expect(Validation.negative('-0.5')).toBe(true); // -0.5 > -1
            expect(Validation.negative('-1')).toBe(false); // -1 is NOT > -1
            expect(Validation.negative('-5')).toBe(false);
        });
        // FIXED: non-numeric input now fails (no longer coerced to 0).
        it('non-numeric input fails the numeric validator (fixed)', () => {
            expect(Validation.negative('abc')).toBe(false);
            expect(Validation.negative('')).toBe(false);
            // numeric behaviour preserved
            expect(Validation.negative('5')).toBe(true);
            expect(Validation.negative('-1')).toBe(false);
        });
    });
});

// -------------------------------------------------------------------------
// Part 2 — getErrors via FormGenerator submit
// -------------------------------------------------------------------------
const tf = (id: string, label: string, extra: any = {}) => ({
    type: 'textfield',
    props: { id, MuiAttributes: { label } },
    layout: { row: 1, xs: 12 },
    ...extra,
});

const submitAndGetErrors = (onSubmit: any) => {
    fireEvent.click(screen.getByLabelText('button'));
    return onSubmit.mock.calls[0][1] as any[];
};

describe('FormGenerator.getErrors — validation integration', () => {
    afterEach(() => ClearFormData());

    it('optional field with an invalid rule + a value → error present', () => {
        const onSubmit = vi.fn();
        const data = [tf('mail', 'Email', {
            rules: { validation: [{ rule: 'email', message: 'Bad email' }] },
        })];
        render(<FormGenerator guid="v-1" data={data} patch={{ mail: 'not-an-email' }} onSubmit={onSubmit} />);
        const errors = submitAndGetErrors(onSubmit);
        expect(errors.some((e) => e.id === 'mail' && e.rule === 'email')).toBe(true);
    });

    it('optional field left EMPTY (non-mandatory) → NO error (optional-empty skip)', () => {
        const onSubmit = vi.fn();
        const data = [tf('mail', 'Email', {
            rules: { validation: [{ rule: 'email', message: 'Bad email' }] },
        })];
        render(<FormGenerator guid="v-2" data={data} patch={{ mail: '' }} onSubmit={onSubmit} />);
        const errors = submitAndGetErrors(onSubmit);
        expect(errors.some((e) => e.id === 'mail')).toBe(false);
    });

    it('optional length rule: invalid value errors, empty value skipped', () => {
        const onSubmit = vi.fn();
        const data = [tf('code', 'Code', {
            rules: { validation: [{ rule: 'length', value: { min: 3, max: 5 }, message: 'len' }] },
        })];
        render(<FormGenerator guid="v-3" data={data} patch={{ code: 'ab' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'code')).toBe(true);

        ClearFormData();
        const onSubmit2 = vi.fn();
        render(<FormGenerator guid="v-3b" data={data} patch={{ code: '' }} onSubmit={onSubmit2} />);
        fireEvent.click(screen.getAllByLabelText('button')[1]);
        expect(onSubmit2.mock.calls[0][1].some((e: any) => e.id === 'code')).toBe(false);
    });

    it('mandatory empty → error; mandatory filled → none', () => {
        const onSubmit = vi.fn();
        const data = [tf('name', 'Name', {
            rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
        })];
        render(<FormGenerator guid="v-4" data={data} patch={{ name: '' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'name')).toBe(true);

        ClearFormData();
        const onSubmit2 = vi.fn();
        render(<FormGenerator guid="v-4b" data={data} patch={{ name: 'Alice' }} onSubmit={onSubmit2} />);
        fireEvent.click(screen.getAllByLabelText('button')[1]);
        expect(onSubmit2.mock.calls[0][1].some((e: any) => e.id === 'name')).toBe(false);
    });

    it('unknown rule name on a filled field → NO throw, NO error', () => {
        const onSubmit = vi.fn();
        const data = [tf('x', 'X', {
            rules: { validation: [{ rule: 'zzz', message: 'nope' }] },
        })];
        render(<FormGenerator guid="v-5" data={data} patch={{ x: 'value' }} onSubmit={onSubmit} />);
        expect(() => fireEvent.click(screen.getByLabelText('button'))).not.toThrow();
        expect(onSubmit.mock.calls[0][1].some((e: any) => e.id === 'x')).toBe(false);
    });

    it('hidden field (visibleWhen false) with a mandatory rule → NOT in errors', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('a', 'A'),
            tf('b', 'B', {
                visibleWhen: { field: 'a', op: 'eq', value: 'show' },
                rules: { validation: [{ rule: 'mandatory', message: 'B required' }] },
            }),
        ];
        render(<FormGenerator guid="v-6" data={data} patch={{ a: 'hide' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'b')).toBe(false);
    });

    it('a visible field with a mandatory rule (visibleWhen true) IS validated', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('a', 'A'),
            tf('b', 'B', {
                visibleWhen: { field: 'a', op: 'eq', value: 'show' },
                rules: { validation: [{ rule: 'mandatory', message: 'B required' }] },
            }),
        ];
        render(<FormGenerator guid="v-7" data={data} patch={{ a: 'show', b: '' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'b')).toBe(true);
    });

    it('two failing rules on one field → BOTH reported (not just the first)', () => {
        const onSubmit = vi.fn();
        const data = [tf('f', 'F', {
            rules: {
                validation: [
                    { rule: 'length', value: { min: 5 }, message: 'too short' },
                    { rule: 'email', message: 'bad email' },
                ],
            },
        })];
        render(<FormGenerator guid="v-8" data={data} patch={{ f: 'x' }} onSubmit={onSubmit} />);
        const errs = submitAndGetErrors(onSubmit).filter((e) => e.id === 'f');
        // getErrors iterates the whole validation list and pushes every failure.
        expect(errs.map((e) => e.rule).sort()).toEqual(['email', 'length']);
    });

    it('cross-field equalsField: mismatch errors, match passes', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('pwd', 'Password'),
            tf('confirm', 'Confirm', {
                rules: { validation: [{ rule: 'equalsField', field: 'pwd', message: 'must match' }] },
            }),
        ];
        render(<FormGenerator guid="v-9" data={data} patch={{ pwd: 'abc', confirm: 'xyz' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'confirm' && e.rule === 'equalsField')).toBe(true);

        ClearFormData();
        const onSubmit2 = vi.fn();
        render(<FormGenerator guid="v-9b" data={data} patch={{ pwd: 'abc', confirm: 'abc' }} onSubmit={onSubmit2} />);
        fireEvent.click(screen.getAllByLabelText('button')[1]);
        expect(onSubmit2.mock.calls[0][1].some((e: any) => e.id === 'confirm')).toBe(false);
    });

    it('cross-field gtField compares numeric strings', () => {
        const onSubmit = vi.fn();
        const data = [
            tf('min', 'Min'),
            tf('amount', 'Amount', {
                rules: { validation: [{ rule: 'gtField', field: 'min', message: 'must exceed min' }] },
            }),
        ];
        render(<FormGenerator guid="v-10" data={data} patch={{ min: '5', amount: '3' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'amount')).toBe(true);

        ClearFormData();
        const onSubmit2 = vi.fn();
        render(<FormGenerator guid="v-10b" data={data} patch={{ min: '5', amount: '10' }} onSubmit={onSubmit2} />);
        fireEvent.click(screen.getAllByLabelText('button')[1]);
        expect(onSubmit2.mock.calls[0][1].some((e: any) => e.id === 'amount')).toBe(false);
    });

    it('mandatoryselect: "" → error, [] → error, ["x"] → none', () => {
        const data = [tf('sel', 'Select', {
            rules: { validation: [{ rule: 'mandatoryselect', message: 'pick one' }] },
        })];

        const onEmpty = vi.fn();
        const r1 = render(<FormGenerator guid="v-11a" data={data} patch={{ sel: '' }} onSubmit={onEmpty} />);
        fireEvent.click(screen.getByLabelText('button'));
        expect(onEmpty.mock.calls[0][1].some((e: any) => e.id === 'sel')).toBe(true);
        r1.unmount();
        ClearFormData();

        const onArrEmpty = vi.fn();
        const r2 = render(<FormGenerator guid="v-11b" data={data} patch={{ sel: [] }} onSubmit={onArrEmpty} />);
        fireEvent.click(screen.getByLabelText('button'));
        expect(onArrEmpty.mock.calls[0][1].some((e: any) => e.id === 'sel')).toBe(true);
        r2.unmount();
        ClearFormData();

        const onFilled = vi.fn();
        render(<FormGenerator guid="v-11c" data={data} patch={{ sel: ['x'] }} onSubmit={onFilled} />);
        fireEvent.click(screen.getByLabelText('button'));
        expect(onFilled.mock.calls[0][1].some((e: any) => e.id === 'sel')).toBe(false);
    });

    it('requiredWhen injects a mandatory rule only while its condition holds', () => {
        const data = [
            tf('kind', 'Kind'),
            tf('other', 'Other', { requiredWhen: { field: 'kind', op: 'eq', value: 'other' } }),
        ];
        const onHolds = vi.fn();
        render(<FormGenerator guid="v-12a" data={data} patch={{ kind: 'other', other: '' }} onSubmit={onHolds} />);
        fireEvent.click(screen.getByLabelText('button'));
        expect(onHolds.mock.calls[0][1].some((e: any) => e.id === 'other')).toBe(true);
        ClearFormData();

        const onNot = vi.fn();
        render(<FormGenerator guid="v-12b" data={data} patch={{ kind: 'std', other: '' }} onSubmit={onNot} />);
        fireEvent.click(screen.getAllByLabelText('button')[1]);
        expect(onNot.mock.calls[0][1].some((e: any) => e.id === 'other')).toBe(false);
    });

    // ---- Bugs surfaced through the form path -----------------------------

    // FIXED: a required text field filled only with spaces now fails at form level.
    it('mandatory field with whitespace-only value fails at form level (fixed)', () => {
        const onSubmit = vi.fn();
        const data = [tf('name', 'Name', {
            rules: { validation: [{ rule: 'mandatory', message: 'Required' }] },
        })];
        render(<FormGenerator guid="v-13" data={data} patch={{ name: '   ' }} onSubmit={onSubmit} />);
        expect(submitAndGetErrors(onSubmit).some((e) => e.id === 'name')).toBe(true);
    });
});
