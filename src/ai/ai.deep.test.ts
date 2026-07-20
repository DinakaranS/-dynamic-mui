import { describe, it, expect, vi } from 'vitest';
import { simpleFieldsToFormFields, formFieldsToSimple, fieldsForExtraction, slug } from './mapping';
import { createAIClient } from './client';
import type { SimpleField } from './types';
import type { FormField } from '../types';

// ---------------------------------------------------------------------------
// slug
// ---------------------------------------------------------------------------
describe('slug', () => {
    it('lowercases and snake_cases spaces', () => {
        expect(slug('Full Name')).toBe('full_name');
    });
    it('trims and collapses punctuation runs, stripping edges', () => {
        expect(slug('  E-mail!! ')).toBe('e_mail');
    });
    it('empty string falls back to "field"', () => {
        expect(slug('')).toBe('field');
    });
    it('all-symbols falls back to "field"', () => {
        expect(slug('!!!')).toBe('field');
    });
    it('keeps leading digits', () => {
        expect(slug('123 Main')).toBe('123_main');
    });
    it('unicode letters are non-[a-z0-9] and become separators', () => {
        expect(slug('Café Crème')).toBe('caf_cr_me');
    });
    it('collapses multiple separators into one underscore', () => {
        expect(slug('a  ---  b')).toBe('a_b');
    });
    it('handles null-ish via String(s||"")', () => {
        // @ts-expect-error intentional bad input
        expect(slug(undefined)).toBe('field');
        // @ts-expect-error intentional bad input
        expect(slug(null)).toBe('field');
    });
});

// ---------------------------------------------------------------------------
// simpleFieldsToFormFields
// ---------------------------------------------------------------------------
describe('simpleFieldsToFormFields', () => {
    it('non-array input returns []', () => {
        // @ts-expect-error intentional bad input
        expect(simpleFieldsToFormFields(null)).toEqual([]);
        // @ts-expect-error intentional bad input
        expect(simpleFieldsToFormFields({})).toEqual([]);
    });

    it('email → textfield with email rule + inputType', () => {
        const [f] = simpleFieldsToFormFields([{ type: 'email', id: 'e', label: 'Email' }]);
        expect(f.type).toBe('textfield');
        expect(f.props.MuiAttributes.type).toBe('email');
        expect(f.rules?.validation).toContainEqual({ rule: 'email', message: 'Enter a valid Email' });
    });

    it('number → numberfield, tel → phone, money → currency', () => {
        const out = simpleFieldsToFormFields([
            { type: 'number', id: 'n', label: 'N' },
            { type: 'tel', id: 't', label: 'T' },
            { type: 'money', id: 'm', label: 'M' },
        ]);
        expect(out.map((f) => f.type)).toEqual(['numberfield', 'phone', 'currency']);
    });

    it('dropdown/multiselect → select', () => {
        const out = simpleFieldsToFormFields([
            { type: 'dropdown', id: 'd', label: 'D' },
            { type: 'multiselect', id: 'ms', label: 'MS' },
        ]);
        expect(out.map((f) => f.type)).toEqual(['select', 'select']);
    });

    it('boolean/toggle → switch, chips → chipselect, tags → tagsinput', () => {
        const out = simpleFieldsToFormFields([
            { type: 'boolean', id: 'b', label: 'B' },
            { type: 'toggle', id: 'tg', label: 'Tg' },
            { type: 'chips', id: 'c', label: 'C' },
            { type: 'tags', id: 'tags', label: 'Tags' },
        ]);
        expect(out.map((f) => f.type)).toEqual(['switch', 'switch', 'chipselect', 'tagsinput']);
    });

    it('date → datetime', () => {
        const [f] = simpleFieldsToFormFields([{ type: 'date', id: 'd', label: 'D' }]);
        expect(f.type).toBe('datetime');
    });

    it('unknown type passes through; missing type → textfield', () => {
        const out = simpleFieldsToFormFields([
            { type: 'weirdo', id: 'w', label: 'W' },
            // @ts-expect-error missing type
            { id: 'x', label: 'X' },
        ]);
        expect(out[0].type).toBe('weirdo');
        expect(out[1].type).toBe('textfield');
    });

    it('select options land in props.options as {value,label}', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'select', id: 's', label: 'S', options: ['New York', 'LA'] },
        ]);
        expect(f.props.options).toEqual([
            { value: 'new_york', label: 'New York' },
            { value: 'la', label: 'LA' },
        ]);
    });

    it('radio options land in props.MuiFCLabels (raw) + MuiFLabel', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'radio', id: 'r', label: 'Choose', options: ['Yes', 'No'] },
        ]);
        expect(f.props.MuiFCLabels).toEqual(['Yes', 'No']);
        expect(f.props.MuiFLabel).toBe('Choose');
        expect(f.props.options).toBeUndefined();
    });

    it('chipselect/togglebuttons also set props.label and multiple', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'chipselect', id: 'c', label: 'Tags', options: ['a', 'b'], multiple: true },
        ]);
        expect(f.props.label).toBe('Tags');
        expect(f.props.multiple).toBe(true);
        expect(f.props.options).toEqual([
            { value: 'a', label: 'a' },
            { value: 'b', label: 'b' },
        ]);
    });

    it('required uses mandatoryselect for choice types, mandatory otherwise', () => {
        const [txt] = simpleFieldsToFormFields([{ type: 'text', id: 't', label: 'T', required: true }]);
        const [sel] = simpleFieldsToFormFields([{ type: 'select', id: 's', label: 'S', required: true }]);
        expect(txt.rules?.validation?.[0].rule).toBe('mandatory');
        expect(sel.rules?.validation?.[0].rule).toBe('mandatoryselect');
    });

    it('width half→sm6, third→sm4, default→sm12', () => {
        const out = simpleFieldsToFormFields([
            { type: 'text', id: 'a', label: 'A', width: 'half' },
            { type: 'text', id: 'b', label: 'B', width: 'third' },
            { type: 'text', id: 'c', label: 'C' },
        ]);
        expect(out.map((f) => f.layout?.sm)).toEqual([6, 4, 12]);
    });

    it('missing id derives from label; layout.row increments', () => {
        const out = simpleFieldsToFormFields([
            // @ts-expect-error missing id
            { type: 'text', label: 'First Name' },
            // @ts-expect-error missing id
            { type: 'text', label: 'Last Name' },
        ]);
        expect(out[0].props.id).toBe('first_name');
        expect(out[1].props.id).toBe('last_name');
        expect(out.map((f) => f.layout?.row)).toEqual([1, 2]);
    });

    it('computed sets props.formula, field.formula and type computed', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'computed', id: 'total', label: 'Total', formula: 'qty * price' },
        ]);
        expect(f.type).toBe('computed');
        expect(f.props.formula).toBe('qty * price');
        expect(f.formula).toBe('qty * price');
    });

    it('visibleWhen passthrough only when field present', () => {
        const out = simpleFieldsToFormFields([
            { type: 'text', id: 'a', label: 'A', visibleWhen: { field: 'b', op: 'eq', value: 1 } },
            { type: 'text', id: 'c', label: 'C', visibleWhen: { field: '', value: 2 } as any },
        ]);
        expect(out[0].visibleWhen).toEqual({ field: 'b', op: 'eq', value: 1 });
        expect(out[1].visibleWhen).toBeUndefined();
    });

    it('select with multiple sets MuiAttributes.multiple', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'select', id: 's', label: 'S', options: ['a'], multiple: true },
        ]);
        expect(f.props.MuiAttributes.multiple).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// fieldsForExtraction
// ---------------------------------------------------------------------------
describe('fieldsForExtraction', () => {
    it('non-array returns []', () => {
        // @ts-expect-error bad input
        expect(fieldsForExtraction(null)).toEqual([]);
    });

    it('skips fields with no id', () => {
        const out = fieldsForExtraction([{ type: 'textfield', props: {} } as any]);
        expect(out).toEqual([]);
    });

    it('derives options from props.options objects', () => {
        const [f] = fieldsForExtraction([
            {
                type: 'select',
                props: { id: 's', MuiAttributes: { label: 'S' }, options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
            } as any,
        ]);
        expect(f.options).toEqual(['a', 'b']);
        expect(f.label).toBe('S');
    });

    it('derives options from plain-string props.options', () => {
        const [f] = fieldsForExtraction([
            { type: 'select', props: { id: 's', options: ['x', 'y'] } } as any,
        ]);
        expect(f.options).toEqual(['x', 'y']);
    });

    it('derives options from MuiFCLabels', () => {
        const [f] = fieldsForExtraction([
            { type: 'radio', props: { id: 'r', MuiFCLabels: ['Yes', 'No'], MuiFLabel: 'Q' } } as any,
        ]);
        expect(f.options).toEqual(['Yes', 'No']);
        expect(f.label).toBe('Q');
    });

    it('reads format from props.format or MuiAttributes.format', () => {
        const out = fieldsForExtraction([
            { type: 'datetime', props: { id: 'd1', format: 'MM/DD/YYYY' } } as any,
            { type: 'datetime', props: { id: 'd2', MuiAttributes: { format: 'YYYY-MM-DD' } } } as any,
        ]);
        expect(out[0].format).toBe('MM/DD/YYYY');
        expect(out[1].format).toBe('YYYY-MM-DD');
    });

    it('id can come from f.id or props.id', () => {
        const out = fieldsForExtraction([
            { id: 'top', type: 't', props: {} } as any,
            { type: 't', props: { id: 'inner' } } as any,
        ]);
        expect(out.map((o) => o.id)).toEqual(['top', 'inner']);
    });
});

// ---------------------------------------------------------------------------
// round-trip: simple → form → simple
// ---------------------------------------------------------------------------
describe('formFieldsToSimple round-trip', () => {
    it('non-array returns []', () => {
        // @ts-expect-error bad input
        expect(formFieldsToSimple(null)).toEqual([]);
    });

    it('preserves id/label/required/options/width for select', () => {
        const original: SimpleField[] = [
            { type: 'select', id: 'country', label: 'Country', required: true, options: ['USA', 'UK'], width: 'half' },
        ];
        const round = formFieldsToSimple(simpleFieldsToFormFields(original));
        expect(round[0]).toMatchObject({
            type: 'select',
            id: 'country',
            label: 'Country',
            required: true,
            options: ['USA', 'UK'],
            width: 'half',
        });
    });

    it('preserves radio options via MuiFCLabels', () => {
        const original: SimpleField[] = [
            { type: 'radio', id: 'q', label: 'Q', options: ['Yes', 'No'], width: 'third' },
        ];
        const round = formFieldsToSimple(simpleFieldsToFormFields(original));
        expect(round[0].options).toEqual(['Yes', 'No']);
        expect(round[0].width).toBe('third');
        expect(round[0].required).toBe(false);
    });

    it('full width default round-trips', () => {
        const round = formFieldsToSimple(simpleFieldsToFormFields([{ type: 'text', id: 't', label: 'T' }]));
        expect(round[0].width).toBe('full');
    });

    it('preserves multiple + placeholder + helperText', () => {
        const original: SimpleField[] = [
            { type: 'select', id: 's', label: 'S', options: ['a'], multiple: true, placeholder: 'pick', helperText: 'help' },
        ];
        const round = formFieldsToSimple(simpleFieldsToFormFields(original));
        expect(round[0].multiple).toBe(true);
        expect(round[0].placeholder).toBe('pick');
        expect(round[0].helperText).toBe('help');
    });

    it('preserves computed formula', () => {
        const round = formFieldsToSimple(
            simpleFieldsToFormFields([{ type: 'computed', id: 'c', label: 'C', formula: 'a + b' }]),
        );
        expect(round[0].formula).toBe('a + b');
    });
});

// ---------------------------------------------------------------------------
// client (mocked fetch)
// ---------------------------------------------------------------------------
type FetchCall = { url: string; init: any };
const makeFetch = (content: any, opts: { ok?: boolean; status?: number; raw?: any } = {}) => {
    const calls: FetchCall[] = [];
    const impl = vi.fn(async (url: string, init: any) => {
        calls.push({ url, init });
        return {
            ok: opts.ok ?? true,
            status: opts.status ?? 200,
            statusText: opts.status === 500 ? 'Internal Server Error' : 'OK',
            json: async () => opts.raw ?? { choices: [{ message: { content } }] },
        } as any;
    });
    return { impl, calls };
};

const client = (fetchImpl: any) =>
    createAIClient({ endpoint: 'https://proxy.example/ai', fetchImpl });

describe('createAIClient', () => {
    it('throws without endpoint', () => {
        // @ts-expect-error missing endpoint
        expect(() => createAIClient({})).toThrow(/endpoint/);
    });

    it('chat json mode parses a plain JSON object', async () => {
        const { impl } = makeFetch('{"a":1}');
        const out = await client(impl).chat({ json: true, messages: [{ role: 'user', content: 'hi' }] });
        expect(out).toEqual({ a: 1 });
    });

    it('chat json tolerates ```json fenced``` content', async () => {
        const { impl } = makeFetch('```json\n{"a":2}\n```');
        const out = await client(impl).chat({ json: true, messages: [{ role: 'user', content: 'hi' }] });
        expect(out).toEqual({ a: 2 });
    });

    it('chat json extracts JSON embedded in prose', async () => {
        const { impl } = makeFetch('Sure! Here you go: {"a":3} — enjoy.');
        const out = await client(impl).chat({ json: true, messages: [{ role: 'user', content: 'hi' }] });
        expect(out).toEqual({ a: 3 });
    });

    it('chat json degrades garbage to {}', async () => {
        const { impl } = makeFetch('not json at all');
        const out = await client(impl).chat({ json: true, messages: [{ role: 'user', content: 'hi' }] });
        expect(out).toEqual({});
    });

    it('chat sets response_format only when json:true', async () => {
        const jsonF = makeFetch('{}');
        await client(jsonF.impl).chat({ json: true, messages: [{ role: 'user', content: 'x' }] });
        expect(JSON.parse(jsonF.calls[0].init.body).response_format).toEqual({ type: 'json_object' });

        const plainF = makeFetch('hello');
        await client(plainF.impl).chat({ messages: [{ role: 'user', content: 'x' }] });
        expect(JSON.parse(plainF.calls[0].init.body).response_format).toBeUndefined();
    });

    it('non-ok response throws', async () => {
        const { impl } = makeFetch('{}', { ok: false, status: 500 });
        await expect(
            client(impl).chat({ messages: [{ role: 'user', content: 'x' }] }),
        ).rejects.toThrow(/500/);
    });

    it('assistText returns plain string, no response_format', async () => {
        const { impl, calls } = makeFetch('polished text');
        const out = await client(impl).assistText('rough', 'professional');
        expect(out).toBe('polished text');
        expect(JSON.parse(calls[0].init.body).response_format).toBeUndefined();
        expect(JSON.parse(calls[0].init.body).temperature).toBe(0.4);
    });

    it('generateForm maps {fields:[...]}', async () => {
        const { impl } = makeFetch(JSON.stringify({ fields: [{ type: 'email', id: 'e', label: 'Email' }] }));
        const out = await client(impl).generateForm('a contact form');
        expect(out[0].type).toBe('textfield');
        expect(out[0].props.MuiAttributes.type).toBe('email');
    });

    it('generateForm tolerates a bare array (no {fields})', async () => {
        const { impl } = makeFetch(JSON.stringify([{ type: 'text', id: 't', label: 'T' }]));
        const out = await client(impl).generateForm('x');
        expect(out).toHaveLength(1);
        expect(out[0].type).toBe('textfield');
    });

    it('extractToFields returns the values object', async () => {
        const { impl } = makeFetch(JSON.stringify({ values: { name: 'Ada', age: 30 } }));
        const out = await client(impl).extractToFields('Ada, 30', [{ id: 'name' }, { id: 'age' }]);
        expect(out).toEqual({ name: 'Ada', age: 30 });
    });

    it('extractToFields degrades empty content to {}', async () => {
        const { impl } = makeFetch('');
        const out = await client(impl).extractToFields('x', [{ id: 'a' }]);
        expect(out).toEqual({});
    });

    it('generateForm degrades garbage to []', async () => {
        const { impl } = makeFetch('garbage');
        const out = await client(impl).generateForm('x');
        expect(out).toEqual([]);
    });

    it('generateFormFromImage puts an image_url content part in the user message', async () => {
        const { impl, calls } = makeFetch(JSON.stringify({ fields: [] }));
        await client(impl).generateFormFromImage('https://img.example/form.png', 'digitize');
        const body = JSON.parse(calls[0].init.body);
        const userMsg = body.messages.find((m: any) => m.role === 'user');
        expect(Array.isArray(userMsg.content)).toBe(true);
        expect(userMsg.content).toContainEqual({ type: 'image_url', image_url: { url: 'https://img.example/form.png' } });
    });

    it('accepts proxy { content } and { result } shapes', async () => {
        const c1 = makeFetch(undefined, { raw: { content: '{"a":1}' } });
        expect(await client(c1.impl).chat({ json: true, messages: [{ role: 'user', content: 'x' }] })).toEqual({ a: 1 });
        const c2 = makeFetch(undefined, { raw: { result: 'plain' } });
        expect(await client(c2.impl).chat({ messages: [{ role: 'user', content: 'x' }] })).toBe('plain');
    });

    it('editForm round-trips a select through the model unchanged', async () => {
        const current = simpleFieldsToFormFields([
            { type: 'select', id: 'country', label: 'Country', options: ['USA', 'UK'], required: true, width: 'half' },
        ]);
        // Model echoes back the simplified form it was given.
        const simple = formFieldsToSimple(current);
        const { impl } = makeFetch(JSON.stringify({ fields: simple }));
        const out = await client(impl).editForm(current, 'no change');
        const round = formFieldsToSimple(out);
        expect(round[0]).toMatchObject({ id: 'country', label: 'Country', required: true, options: ['USA', 'UK'], width: 'half' });
    });

    it('reviewForm returns issues array + improved fields', async () => {
        const { impl } = makeFetch(
            JSON.stringify({
                issues: [{ kind: 'label', severity: 'warning', message: 'bad' }],
                improved: [{ type: 'text', id: 'a', label: 'A' }],
            }),
        );
        const out = await client(impl).reviewForm([]);
        expect(out.issues).toHaveLength(1);
        expect(out.improved?.[0].type).toBe('textfield');
    });
});

// ---------------------------------------------------------------------------
// Adversarial edge probes — documented ACTUAL behavior (some surprising).
// ---------------------------------------------------------------------------
describe('adversarial edge probes', () => {
    // BUG: the 'multiselect' alias (mapping.ts:31) maps to a plain 'select' and
    // multiple is only ever set for f.multiple===true (mapping.ts:72). A model
    // emitting type:'multiselect' -- whose very name means multi-value -- gets a
    // SINGLE select. Expected: the alias should imply MuiAttributes.multiple.
    it('multiselect alias enables multiple selection (fixed)', () => {
        const [f] = simpleFieldsToFormFields([{ type: 'multiselect', id: 's', label: 'S', options: ['a', 'b'] }]);
        expect(f.props.MuiAttributes.multiple).toBe(true);
    });

    // BUG: for chipselect/togglebuttons, props.multiple is set only INSIDE the
    // `if (f.options && f.options.length)` block (mapping.ts:80-83). So a
    // chipselect with multiple:true but no options silently drops the flag --
    // the multiple handling is wrongly coupled to options presence.
    it('chipselect multiple flag survives with no options (fixed)', () => {
        const [f] = simpleFieldsToFormFields([{ type: 'chipselect', id: 'c', label: 'C', multiple: true }]);
        expect(f.props.multiple).toBe(true);
    });

    it('ACTUAL: greedy regex on prose-wrapped array-of-objects still yields the array', () => {
        const { impl } = makeFetch('Result: [{"a":1},{"a":2}] done');
        return client(impl)
            .chat({ json: true, messages: [{ role: 'user', content: 'x' }] })
            .then((out) => expect(out).toEqual([{ a: 1 }, { a: 2 }]));
    });

    it('ACTUAL: object-before-array prose loses the trailing array (greedy {..})', async () => {
        const { impl } = makeFetch('x {"a":1} y [1,2]');
        const out = await client(impl).chat({ json: true, messages: [{ role: 'user', content: 'x' }] });
        expect(out).toEqual({ a: 1 });
    });

    it('ACTUAL: email alias round-trips to textfield (semantic type not restored)', () => {
        const round = formFieldsToSimple(simpleFieldsToFormFields([{ type: 'email', id: 'e', label: 'Email' }]));
        expect(round[0].type).toBe('textfield');
    });

    it('ACTUAL: emoji-only slug falls back to "field"', () => {
        expect(slug('😀🎉')).toBe('field');
    });

    it('ACTUAL: togglebuttons required uses mandatoryselect and options become objects', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'segmented', id: 'seg', label: 'Seg', options: ['Low', 'High'], required: true },
        ]);
        expect(f.type).toBe('togglebuttons');
        expect(f.props.options).toEqual([{ value: 'low', label: 'Low' }, { value: 'high', label: 'High' }]);
        expect(f.rules?.validation?.[0].rule).toBe('mandatoryselect');
    });

    it('ACTUAL: duplicate labels produce duplicate ids (no de-dupe)', () => {
        const out = simpleFieldsToFormFields([
            // @ts-expect-error missing id
            { type: 'text', label: 'Name' },
            // @ts-expect-error missing id
            { type: 'text', label: 'Name' },
        ]);
        expect(out[0].props.id).toBe('name');
        expect(out[1].props.id).toBe('name');
    });

    it('ACTUAL: extractToFields returns a values array when model nests one', async () => {
        const { impl } = makeFetch(JSON.stringify({ values: [1, 2, 3] }));
        const out = await client(impl).extractToFields('x', [{ id: 'a' }]);
        // typeof [] === 'object' so the array passes through as-is.
        expect(out).toEqual([1, 2, 3]);
    });

    // BUG: fieldsForExtraction branches on `Array.isArray(props.options)`
    // (mapping.ts:129) which is true for an EMPTY array, short-circuiting the
    // `else if (MuiFCLabels)` branch. A field carrying options:[] plus real
    // MuiFCLabels loses its option list. Expected: fall through to MuiFCLabels.
    it('empty props.options [] falls through to MuiFCLabels (fixed)', () => {
        const [f] = fieldsForExtraction([
            { type: 'radio', props: { id: 'r', options: [], MuiFCLabels: ['a', 'b'] } } as any,
        ]);
        expect(f.options).toEqual(['a', 'b']);
    });

    it('ACTUAL: non-string plain chat content is String()-coerced', async () => {
        const { impl } = makeFetch(undefined, { raw: { result: { nested: 1 } } });
        const out = await client(impl).chat({ messages: [{ role: 'user', content: 'x' }] });
        expect(out).toBe('[object Object]');
    });
});
