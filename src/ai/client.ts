import type { FormField } from '../types';
import type {
    AIClient,
    AIClientConfig,
    AssistAction,
    ChatRequest,
    ExtractionField,
    GenerateOptions,
    ReviewResult,
    SimpleField,
} from './types';
import { simpleFieldsToFormFields, formFieldsToSimple } from './mapping';

const DEFAULT_MODEL = 'gpt-4o-mini';

// Curated control set the generator is allowed to use (kept in the prompt).
const DEFAULT_TYPES = [
    'textfield', 'textarea', 'email', 'number', 'phone', 'currency', 'password',
    'date', 'time', 'daterange', 'select', 'radio', 'checkbox', 'switch',
    'chipselect', 'togglebuttons', 'tags', 'rating', 'slider', 'file',
    'signature', 'address', 'color', 'markdown', 'otp', 'computed', 'geo',
];

const FIELD_SHAPE = `Each field: {
  "type": one of the allowed types,
  "id": snake_case string,
  "label": string,
  "required": boolean (optional),
  "placeholder": string (optional),
  "helperText": string (optional),
  "options": string[] (only for select/radio/chipselect/togglebuttons),
  "multiple": boolean (optional),
  "width": "full" | "half" | "third" (optional),
  "formula": string like "qty * price" (only for computed),
  "visibleWhen": { "field": id, "op": "eq", "value": any } (optional)
}`;

const safeParse = (raw: any): any => {
    if (raw && typeof raw === 'object') return raw;
    if (typeof raw !== 'string') return {};
    try {
        return JSON.parse(raw);
    } catch {
        // Tolerate models that wrap JSON in prose / code fences.
        const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) {
            try { return JSON.parse(match[0]); } catch { /* fall through */ }
        }
        return {};
    }
};

export function createAIClient(config: AIClientConfig): AIClient {
    if (!config?.endpoint) {
        throw new Error(
            'createAIClient: `endpoint` is required. Point it at YOUR backend proxy that ' +
            'holds the OpenAI key — never embed the key in client code.',
        );
    }
    const doFetch = config.fetchImpl || (typeof fetch !== 'undefined' ? fetch : undefined);
    if (!doFetch) throw new Error('createAIClient: no fetch implementation available.');

    async function chat(req: ChatRequest): Promise<any> {
        const body: Record<string, any> = {
            model: req.model || config.model || DEFAULT_MODEL,
            messages: req.messages,
            temperature: req.temperature ?? 0.2,
        };
        if (req.json) body.response_format = { type: 'json_object' };

        const res = await doFetch!(config.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config.headers || {}) },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`AI request failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        // Accept either a raw OpenAI response or a { content } / { result } proxy shape.
        const content =
            data?.choices?.[0]?.message?.content ??
            data?.content ??
            data?.result ??
            data;
        return req.json ? safeParse(content) : (typeof content === 'string' ? content : String(content ?? ''));
    }

    async function generateForm(prompt: string, opts?: GenerateOptions): Promise<FormField[]> {
        const types = opts?.allowedTypes || DEFAULT_TYPES;
        const out = await chat({
            json: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a form designer. Given a request, output ONLY JSON of the form ' +
                        '{ "fields": SimpleField[] }. ' +
                        `Allowed "type" values: ${types.join(', ')}. ` +
                        FIELD_SHAPE +
                        ' Choose sensible types, ids, labels, required flags and widths. ' +
                        'Group related short fields with width "half". Do not include markdown or commentary.',
                },
                { role: 'user', content: prompt },
            ],
        });
        return simpleFieldsToFormFields((out?.fields || out) as SimpleField[]);
    }

    async function editForm(current: FormField[], instruction: string): Promise<FormField[]> {
        const simple = formFieldsToSimple(current);
        const out = await chat({
            json: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'You edit form schemas. You are given the current fields as JSON and an ' +
                        'instruction. Return ONLY JSON { "fields": SimpleField[] } for the FULL ' +
                        'updated form (not a diff). Preserve unrelated fields and their ids. ' +
                        FIELD_SHAPE,
                },
                { role: 'user', content: `Current fields:\n${JSON.stringify(simple)}\n\nInstruction: ${instruction}` },
            ],
        });
        return simpleFieldsToFormFields((out?.fields || out) as SimpleField[]);
    }

    async function reviewForm(current: FormField[]): Promise<ReviewResult> {
        const simple = formFieldsToSimple(current);
        const out = await chat({
            json: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a form UX and data-quality reviewer. Review the given fields and ' +
                        'return ONLY JSON { "issues": Issue[], "improved": SimpleField[] }. ' +
                        'Issue = { field?: id, kind: "label"|"validation"|"logic"|"type"|"accessibility"|"other", ' +
                        'severity: "info"|"suggestion"|"warning", message: string }. ' +
                        '"improved" is the full form with your fixes applied. ' + FIELD_SHAPE,
                },
                { role: 'user', content: `Fields:\n${JSON.stringify(simple)}` },
            ],
        });
        return {
            issues: Array.isArray(out?.issues) ? out.issues : [],
            improved: out?.improved ? simpleFieldsToFormFields(out.improved as SimpleField[]) : undefined,
        };
    }

    async function extractToFields(
        text: string,
        fields: ExtractionField[],
    ): Promise<Record<string, any>> {
        const out = await chat({
            json: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'Extract structured data from the user text to fill a form. ' +
                        'Return ONLY JSON { "values": { <fieldId>: value } }. ' +
                        'Only include fields you are confident about; omit unknowns. ' +
                        'For fields that list `options`, return EXACTLY one of those option values ' +
                        '(an array of them when the field is multi-select). For fields with a `format`, ' +
                        'format the value accordingly. Otherwise use plain strings/numbers/booleans.',
                },
                {
                    role: 'user',
                    content: `Fields:\n${JSON.stringify(fields)}\n\nText:\n${text}`,
                },
            ],
        });
        return (out?.values && typeof out.values === 'object') ? out.values : (out || {});
    }

    const imageParts = (images: string | string[]) =>
        (Array.isArray(images) ? images : [images])
            .filter(Boolean)
            .map((url) => ({ type: 'image_url' as const, image_url: { url } }));

    async function generateFormFromImage(
        images: string | string[],
        prompt?: string,
        opts?: GenerateOptions,
    ): Promise<FormField[]> {
        const types = opts?.allowedTypes || DEFAULT_TYPES;
        const out = await chat({
            json: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'You digitize documents into forms. Look at the image(s) and output ONLY JSON ' +
                        '{ "fields": SimpleField[] } that reproduces the form/fields shown. ' +
                        `Allowed "type" values: ${types.join(', ')}. ` + FIELD_SHAPE,
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt || 'Recreate this form as fields.' },
                        ...imageParts(images),
                    ],
                },
            ],
        });
        return simpleFieldsToFormFields((out?.fields || out) as SimpleField[]);
    }

    async function extractFromImage(
        images: string | string[],
        fields: ExtractionField[],
    ): Promise<Record<string, any>> {
        const out = await chat({
            json: true,
            messages: [
                {
                    role: 'system',
                    content:
                        'Extract structured data from the document image(s) to fill a form. ' +
                        'Return ONLY JSON { "values": { <fieldId>: value } }. Only include fields you ' +
                        'are confident about; omit unknowns. For fields that list `options`, return ' +
                        'EXACTLY one of those option values; honor any `format` given.',
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: `Fields:\n${JSON.stringify(fields)}` },
                        ...imageParts(images),
                    ],
                },
            ],
        });
        return (out?.values && typeof out.values === 'object') ? out.values : (out || {});
    }

    async function assistText(text: string, action: AssistAction, targetLanguage?: string): Promise<string> {
        const instructions: Record<AssistAction, string> = {
            improve: 'Improve the clarity and flow of the text while preserving meaning.',
            summarize: 'Summarize the text concisely.',
            expand: 'Expand the text with more helpful detail.',
            shorten: 'Make the text shorter and tighter.',
            'fix-grammar': 'Fix spelling and grammar. Keep the wording otherwise unchanged.',
            professional: 'Rewrite the text in a professional, polished tone.',
            translate: `Translate the text into ${targetLanguage || 'English'}.`,
        };
        return chat({
            temperature: 0.4,
            messages: [
                { role: 'system', content: `${instructions[action]} Return ONLY the resulting text, no preamble.` },
                { role: 'user', content: text },
            ],
        });
    }

    return {
        chat, generateForm, editForm, reviewForm, extractToFields, assistText,
        generateFormFromImage, extractFromImage,
    };
}
