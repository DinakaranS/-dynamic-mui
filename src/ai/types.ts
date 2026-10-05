import type { FormField } from '../types';

/**
 * A simplified, LLM-friendly field description. The AI works in terms of these
 * (flat, easy to reason about) and the mapping layer converts them to/from the
 * library's richer `FormField` schema.
 */
export interface SimpleField {
    /** Semantic control kind (see mapping for the supported set + aliases). */
    type: string;
    /** Stable field id. */
    id: string;
    /** Human label. */
    label: string;
    required?: boolean;
    placeholder?: string;
    helperText?: string;
    /** Options for choice fields (select/radio/chipselect/togglebuttons). */
    options?: string[];
    multiple?: boolean;
    /** Layout width hint. */
    width?: 'full' | 'half' | 'third';
    /** Arithmetic formula for computed fields, e.g. "qty * price". */
    formula?: string;
    /** Simple conditional-visibility hint. */
    visibleWhen?: { field: string; op?: string; value?: any };
}

export type AssistAction =
    | 'improve' | 'summarize' | 'expand' | 'shorten' | 'fix-grammar' | 'professional' | 'translate';

/** A field descriptor the AI uses when extracting values into a form. */
export interface ExtractionField {
    id: string;
    label?: string;
    type?: string;
    /** Valid option values (for select/radio/chip/etc.) so the model returns a real one. */
    options?: string[];
    /** Date/number format hint, e.g. "MM/DD/YYYY". */
    format?: string;
}

export interface ReviewIssue {
    /** Field id the issue relates to (omitted for form-wide issues). */
    field?: string;
    /** Category of suggestion. */
    kind: 'label' | 'validation' | 'logic' | 'type' | 'accessibility' | 'other';
    severity: 'info' | 'suggestion' | 'warning';
    message: string;
}

export interface ReviewResult {
    issues: ReviewIssue[];
    /** An improved version of the whole form the user can apply wholesale. */
    improved?: FormField[];
}

/** OpenAI content part — text or an image (for vision requests). */
export type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } };

/** Low-level OpenAI-style chat payload sent to the (user-hosted) proxy. */
export interface ChatRequest {
    messages: { role: 'system' | 'user' | 'assistant'; content: string | ContentPart[] }[];
    /** When true, ask the model for a JSON object and parse the response. */
    json?: boolean;
    temperature?: number;
    model?: string;
}

export interface AIClientConfig {
    /** URL of YOUR backend proxy that injects the OpenAI key server-side. */
    endpoint: string;
    /** Extra headers (e.g. auth) sent to your proxy. */
    headers?: Record<string, string>;
    /** Default model (your proxy may override/ignore). Default 'gpt-4o-mini'. */
    model?: string;
    /** Injectable fetch (for tests / non-browser envs). Defaults to global fetch. */
    fetchImpl?: typeof fetch;
}

export interface GenerateOptions {
    /** Restrict generation to these control types (defaults to a curated set). */
    allowedTypes?: string[];
}

export interface AIClient {
    /** Low-level escape hatch — send a chat request to your proxy. */
    chat(req: ChatRequest): Promise<any>;
    /** Natural-language prompt → a renderable form schema. */
    generateForm(prompt: string, opts?: GenerateOptions): Promise<FormField[]>;
    /** Apply a natural-language edit to an existing form. */
    editForm(current: FormField[], instruction: string): Promise<FormField[]>;
    /** Audit a form and suggest improvements (+ an optional improved version). */
    reviewForm(current: FormField[]): Promise<ReviewResult>;
    /** Extract values from free text/paste into the given fields. */
    extractToFields(
        text: string,
        fields: ExtractionField[],
    ): Promise<Record<string, any>>;
    /** Transform a piece of text (rewrite/summarize/translate/…). */
    assistText(text: string, action: AssistAction, targetLanguage?: string): Promise<string>;
    /** Vision: digitize a document/photo of a form into a renderable schema. */
    generateFormFromImage(
        images: string | string[],
        prompt?: string,
        opts?: GenerateOptions,
    ): Promise<FormField[]>;
    /** Vision: read a document/photo (receipt, ID, invoice…) into the given fields. */
    extractFromImage(
        images: string | string[],
        fields: ExtractionField[],
    ): Promise<Record<string, any>>;
}
