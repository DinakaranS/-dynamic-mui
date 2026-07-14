import type { FormField } from '../types';
import type { SimpleField, ExtractionField } from './types';

/** Turn a label into a stable snake_case id/value. */
export const slug = (s: string): string =>
    String(s || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'field';

// Semantic aliases the model may emit → { control type, extra rule/props }.
const TYPE_ALIASES: Record<string, { type: string; rule?: string; inputType?: string }> = {
    text: { type: 'textfield' },
    string: { type: 'textfield' },
    textarea: { type: 'multitextbox' },
    longtext: { type: 'multitextbox' },
    email: { type: 'textfield', rule: 'email', inputType: 'email' },
    number: { type: 'numberfield' },
    integer: { type: 'numberfield' },
    tel: { type: 'phone' },
    phone: { type: 'phone' },
    money: { type: 'currency' },
    currency: { type: 'currency' },
    date: { type: 'datetime' },
    datetime: { type: 'datetime' },
    time: { type: 'timepicker' },
    daterange: { type: 'daterangepicker' },
    dropdown: { type: 'select' },
    select: { type: 'select' },
    multiselect: { type: 'select' },
    radio: { type: 'radio' },
    checkbox: { type: 'checkbox' },
    boolean: { type: 'switch' },
    toggle: { type: 'switch' },
    chips: { type: 'chipselect' },
    tags: { type: 'tagsinput' },
    segmented: { type: 'togglebuttons' },
    rating: { type: 'rating' },
    slider: { type: 'slider' },
    file: { type: 'fileupload' },
    upload: { type: 'fileupload' },
    signature: { type: 'signature' },
    address: { type: 'address' },
    password: { type: 'password' },
    otp: { type: 'otp' },
    color: { type: 'colorpicker' },
    markdown: { type: 'markdown' },
    computed: { type: 'computed' },
    geo: { type: 'geo' },
    location: { type: 'locationfield' },
};

const OPTION_AS_OBJECTS = new Set(['select', 'chipselect', 'togglebuttons', 'cascadeselect']);
const MANDATORY_SELECT_TYPES = new Set(['select', 'chipselect', 'togglebuttons', 'radio', 'tagsinput']);

const widthToSize = (w?: string): number => (w === 'half' ? 6 : w === 'third' ? 4 : 12);

/** Convert LLM-friendly SimpleField[] into renderable FormField[]. */
export function simpleFieldsToFormFields(fields: SimpleField[]): FormField[] {
    if (!Array.isArray(fields)) return [];
    return fields.map((f, i) => {
        const alias = TYPE_ALIASES[f.type] || { type: f.type || 'textfield' };
        const type = alias.type;
        const id = slug(f.id || f.label || `field_${i + 1}`);
        const sm = widthToSize(f.width);

        const MuiAttributes: Record<string, any> = { label: f.label, fullWidth: true };
        if (f.placeholder) MuiAttributes.placeholder = f.placeholder;
        if (f.helperText) MuiAttributes.helperText = f.helperText;
        if (alias.inputType) MuiAttributes.type = alias.inputType;
        if (f.multiple && type === 'select') MuiAttributes.multiple = true;

        const props: Record<string, any> = { id, MuiAttributes };

        // Choice options land in the right prop per control.
        if (f.options && f.options.length) {
            if (OPTION_AS_OBJECTS.has(type)) {
                props.options = f.options.map((o) => ({ value: slug(o), label: o }));
                if (type === 'chipselect' || type === 'togglebuttons') {
                    props.label = f.label;
                    if (f.multiple) props.multiple = true;
                }
            } else if (type === 'radio') {
                props.MuiFCLabels = f.options;
                props.MuiFLabel = f.label;
            }
        }

        if (type === 'computed' && f.formula) props.formula = f.formula;

        // Validation
        const validation: any[] = [];
        if (f.required) {
            const rule = MANDATORY_SELECT_TYPES.has(type) ? 'mandatoryselect' : 'mandatory';
            validation.push({ rule, message: `${f.label || 'This field'} is required` });
        }
        if (alias.rule) {
            validation.push({ rule: alias.rule, message: `Enter a valid ${f.label || alias.rule}` });
        }

        const field: FormField = {
            type,
            props,
            layout: { row: i + 1, xs: 12, sm },
        };
        if (validation.length) field.rules = { validation };
        if (f.formula) field.formula = f.formula;
        if (f.visibleWhen && f.visibleWhen.field) field.visibleWhen = f.visibleWhen as any;
        return field;
    });
}

/**
 * Describe a rendered form's fields for AI extraction — includes each field's
 * valid `options` and `format` so the model returns values the controls accept
 * (e.g. a real Select option value, not just a label guess).
 */
export function fieldsForExtraction(schema: FormField[]): ExtractionField[] {
    if (!Array.isArray(schema)) return [];
    const out: ExtractionField[] = [];
    schema.forEach((f) => {
        const props = f.props || {};
        const mui = props.MuiAttributes || {};
        const id = (f.id || props.id) as string;
        if (!id) return;

        let options: string[] | undefined;
        if (Array.isArray(props.options)) {
            options = props.options.map((o: any) => (typeof o === 'string' ? o : String(o?.value ?? o?.label ?? '')));
        } else if (Array.isArray(props.MuiFCLabels)) {
            options = props.MuiFCLabels.map((o: any) => (typeof o === 'string' ? o : String(o?.value ?? o?.label ?? '')));
        }

        out.push({
            id,
            label: mui.label || props.label || props.MuiFLabel,
            type: f.type,
            options: options && options.length ? options : undefined,
            format: props.format || mui.format,
        });
    });
    return out;
}

/** Best-effort reverse map (FormField[] → SimpleField[]) for edit/review round-trips. */
export function formFieldsToSimple(fields: FormField[]): SimpleField[] {
    if (!Array.isArray(fields)) return [];
    return fields.map((f, i) => {
        const props = f.props || {};
        const mui = props.MuiAttributes || {};
        const id = f.id || props.id || `field_${i + 1}`;
        const label = mui.label || props.label || props.MuiFLabel || id;

        let options: string[] | undefined;
        if (Array.isArray(props.options)) {
            options = props.options.map((o: any) => (typeof o === 'string' ? o : o.label ?? o.value));
        } else if (Array.isArray(props.MuiFCLabels)) {
            options = props.MuiFCLabels.map((o: any) => (typeof o === 'string' ? o : o.label ?? o.value));
        }

        const required = (f.rules?.validation || []).some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        );

        const sm = f.layout?.sm ?? f.layout?.size?.sm;
        const width = sm === 6 ? 'half' : sm === 4 ? 'third' : 'full';

        const simple: SimpleField = { type: f.type || 'textfield', id, label, required, width };
        if (options) simple.options = options;
        if (mui.placeholder) simple.placeholder = mui.placeholder;
        if (mui.helperText) simple.helperText = mui.helperText;
        if (f.formula || props.formula) simple.formula = f.formula || props.formula;
        if (props.multiple || mui.multiple) simple.multiple = true;
        if (f.visibleWhen) simple.visibleWhen = f.visibleWhen as any;
        return simple;
    });
}
