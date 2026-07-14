import { describe, it, expect, vi } from 'vitest';
import { createAIClient } from './client';
import { simpleFieldsToFormFields, formFieldsToSimple, slug } from './mapping';

describe('mapping', () => {
    it('slugifies labels', () => {
        expect(slug('Full Name')).toBe('full_name');
        expect(slug('  E-mail!! ')).toBe('e_mail');
    });

    it('maps simple fields to renderable FormField[]', () => {
        const form = simpleFieldsToFormFields([
            { type: 'email', id: 'email', label: 'Email', required: true, width: 'half' },
            { type: 'select', id: 'role', label: 'Role', options: ['Admin', 'User'] },
        ]);
        expect(form).toHaveLength(2);
        // email → textfield + email rule + mandatory
        expect(form[0].type).toBe('textfield');
        expect(form[0].props?.MuiAttributes.label).toBe('Email');
        expect(form[0].layout?.sm).toBe(6);
        const rules = form[0].rules?.validation.map((r: any) => r.rule);
        expect(rules).toContain('mandatory');
        expect(rules).toContain('email');
        // select → options as {value,label}
        expect(form[1].type).toBe('select');
        expect(form[1].props?.options).toEqual([
            { value: 'admin', label: 'Admin' },
            { value: 'user', label: 'User' },
        ]);
    });

    it('uses mandatoryselect for choice fields', () => {
        const [f] = simpleFieldsToFormFields([{ type: 'chipselect', id: 'tags', label: 'Tags', options: ['A'], required: true }]);
        expect(f.rules?.validation[0].rule).toBe('mandatoryselect');
    });

    it('carries formula and visibleWhen through', () => {
        const [f] = simpleFieldsToFormFields([
            { type: 'computed', id: 'total', label: 'Total', formula: 'qty * price' },
        ]);
        expect(f.type).toBe('computed');
        expect(f.formula).toBe('qty * price');
    });

    it('round-trips form → simple', () => {
        const form = simpleFieldsToFormFields([{ type: 'text', id: 'name', label: 'Name', required: true }]);
        const simple = formFieldsToSimple(form);
        expect(simple[0].id).toBe('name');
        expect(simple[0].label).toBe('Name');
        expect(simple[0].required).toBe(true);
    });
});

// Build a fake proxy that returns an OpenAI-shaped response with the given content.
const mockFetch = (content: any) =>
    vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ choices: [{ message: { content: typeof content === 'string' ? content : JSON.stringify(content) } }] }),
    });

describe('createAIClient', () => {
    it('throws without an endpoint', () => {
        // @ts-expect-error intentional
        expect(() => createAIClient({})).toThrow(/endpoint/);
    });

    it('generateForm posts to the proxy and maps the result', async () => {
        const fetchImpl = mockFetch({ fields: [{ type: 'text', id: 'name', label: 'Name', required: true }] });
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        const form = await client.generateForm('a form with a name');

        expect(fetchImpl).toHaveBeenCalledOnce();
        const [url, init] = fetchImpl.mock.calls[0];
        expect(url).toBe('https://proxy.test/ai');
        const body = JSON.parse((init as any).body);
        expect(body.response_format).toEqual({ type: 'json_object' });
        expect(form[0].props?.MuiAttributes.label).toBe('Name');
    });

    it('extractToFields returns the values map', async () => {
        const fetchImpl = mockFetch({ values: { name: 'Ada', email: 'ada@x.com' } });
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        const values = await client.extractToFields('Ada, ada@x.com', [{ id: 'name' }, { id: 'email' }]);
        expect(values).toEqual({ name: 'Ada', email: 'ada@x.com' });
    });

    it('assistText returns plain text', async () => {
        const fetchImpl = mockFetch('Polished text.');
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        const out = await client.assistText('rough text', 'improve');
        expect(out).toBe('Polished text.');
        const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
        expect(body.response_format).toBeUndefined(); // plain-text mode
    });

    it('tolerates JSON wrapped in prose / code fences', async () => {
        const fetchImpl = mockFetch('Here you go:\n```json\n{"values":{"a":1}}\n```');
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        const values = await client.extractToFields('x', [{ id: 'a' }]);
        expect(values).toEqual({ a: 1 });
    });

    it('throws on a non-ok proxy response', async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' });
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        await expect(client.generateForm('x')).rejects.toThrow(/500/);
    });

    it('generateFormFromImage sends an image content part (vision)', async () => {
        const fetchImpl = mockFetch({ fields: [{ type: 'text', id: 'name', label: 'Name' }] });
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        const form = await client.generateFormFromImage('data:image/png;base64,AAAA');

        const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
        const userMsg = body.messages.find((m: any) => m.role === 'user');
        expect(Array.isArray(userMsg.content)).toBe(true);
        expect(userMsg.content.some((p: any) => p.type === 'image_url')).toBe(true);
        expect(form[0].props?.MuiAttributes.label).toBe('Name');
    });

    it('extractFromImage returns the values map from a document', async () => {
        const fetchImpl = mockFetch({ values: { total: '42.00' } });
        const client = createAIClient({ endpoint: 'https://proxy.test/ai', fetchImpl: fetchImpl as any });
        const values = await client.extractFromImage('data:image/png;base64,AAAA', [{ id: 'total' }]);
        expect(values).toEqual({ total: '42.00' });
    });
});
