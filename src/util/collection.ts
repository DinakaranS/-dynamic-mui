import type { CollectionConfig, CollectionDetailSpec, CollectionTextSpec, FormField } from '../types';

/**
 * Pure helpers for the `collection` control (nested, dialog-edited lists such as
 * Customer Locations → Services / Backflow devices). Kept free of React/MUI so
 * FormGenerator can use them for validation and the review summary without
 * pulling the (lazy) collection UI into the main bundle.
 */

/** A structural problem in a collection tree. `path` locates the offending
 *  LIST: `[]` is the root list, `[0, 'services']` is item 0's services list. */
export interface CollectionIssue {
    path: (string | number)[];
    message: string;
}

const DISPLAY_ONLY = new Set(['typography', 'divider', 'alert', 'image', 'imagelist', 'hyperlink', 'button', 'summary']);

/** Naive English plural for default headings/labels ("Service" → "Services",
 *  "Address" → "Addresses", "Facility" → "Facilities"). */
export const pluralize = (word: string, count = 2): string => {
    if (!word || count === 1) return word;
    if (/(s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
    if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
    return `${word}s`;
};

/** Singular item label for a collection level ("Customer Location"). */
export const itemLabelOf = (config: Partial<CollectionConfig>): string =>
    config.itemLabel || config.title || 'Item';

/** Section heading for a collection level ("Customer Locations"). */
export const titleOf = (config: Partial<CollectionConfig>): string =>
    config.title || pluralize(itemLabelOf(config));

export const toItems = (value: any): Record<string, any>[] =>
    (Array.isArray(value) ? value.filter((v) => v && typeof v === 'object') : []);

const fieldIdOf = (f: FormField): string | undefined => f?.id || f?.props?.id;

/** Find a field definition by id, following `subforms` branches. */
export const findField = (fields: FormField[] = [], id: string): FormField | undefined => {
    for (const f of fields) {
        if (fieldIdOf(f) === id) return f;
        if (Array.isArray(f?.subforms)) {
            for (const sub of f.subforms) {
                const hit = findField(sub.data || [], id);
                if (hit) return hit;
            }
        }
    }
    return undefined;
};

const optionLabel = (options: any[], v: any): string => {
    const opt = options.find((o) => (o && typeof o === 'object' ? o.value : o) === v);
    if (opt == null) return String(v);
    return typeof opt === 'object' ? String(opt.label ?? opt.title ?? opt.value) : String(opt);
};

const isDayjsLike = (v: any) => v && typeof v === 'object' && typeof v.toDate === 'function' && typeof v.isValid === 'function';

/** How each picker type's value is shown ('datetime' is the date-only picker). */
const DATE_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
    datetime: { month: 'short', day: 'numeric', year: 'numeric' },
    datetimepicker: { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' },
    timepicker: { hour: 'numeric', minute: '2-digit' },
};

/** A Date from a dayjs value, Date, or date string. A bare "YYYY-MM-DD" is read
 *  as a LOCAL date (not UTC midnight, which shows the previous day in the US). */
const toDate = (v: any): Date | null => {
    if (isDayjsLike(v)) return v.isValid() ? v.toDate() : null;
    if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;
    if (typeof v === 'string') {
        const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
        if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
        const t = Date.parse(v);
        return Number.isNaN(t) ? null : new Date(t);
    }
    return null;
};

/** Human-readable label of a field definition. */
export const fieldLabel = (field: FormField | undefined): string => {
    const p = field?.props || {};
    return String(p.MuiAttributes?.label || p.MuiBoxAttributes?.label || p.MuiFCLAttributes?.label || p.MuiFLabel || p.label || '');
};

/** Human-readable text for one stored value: option labels for selects/radios,
 *  Yes/No for booleans, formatted dates, joined arrays. */
export const formatValue = (field: FormField | undefined, value: any): string => {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    const dateFormat = DATE_FORMATS[field?.type || ''];
    if (dateFormat || isDayjsLike(value) || value instanceof Date) {
        const d = toDate(value);
        if (d) return d.toLocaleString(undefined, dateFormat || DATE_FORMATS.datetime);
        if (typeof value !== 'string') return '';
    }

    const props = field?.props || {};
    const options = field?.type === 'radio' ? props.MuiFCLabels : props.options;
    if (Array.isArray(options) && options.length) {
        let vals: any[] = Array.isArray(value) ? value : [value];
        const sep = props.separator ?? ';';
        if (!Array.isArray(value) && typeof value === 'string' && props.MuiAttributes?.multiple) vals = value.split(sep);
        return vals.filter((v) => v !== '' && v != null).map((v) => optionLabel(options, v)).join(', ');
    }

    if (Array.isArray(value)) {
        return value
            .map((v) => (v && typeof v === 'object' ? '' : String(v)))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof value === 'object') {
        return Object.values(value)
            .filter((v) => v !== '' && v != null && typeof v !== 'object')
            .join(', ');
    }
    return String(value);
};

/** Clean up separators left dangling by empty template slots:
 *  "Austin, , 78701" → "Austin, 78701", "· Active" → "Active", "Acme ()" → "Acme". */
const tidy = (s: string): string =>
    s
        .replace(/\(\s*\)|\[\s*\]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/([,·|•])(\s*[,·|•])+/g, '$1')
        .replace(/^[\s,·|•]+|[\s,·|•]+$/g, '')
        .replace(/\s+([,])/g, '$1')
        .trim();

/** Resolve a display spec against an item. A spec is a field id (`'name'`), a
 *  template (`'{city}, {state} {zip}'`), a list of ids joined with " · ", or a
 *  function `(item) => string`. */
export const resolveText = (
    spec: CollectionTextSpec | undefined,
    item: Record<string, any>,
    fields: FormField[] = [],
): string => {
    if (spec == null || !item) return '';
    if (typeof spec === 'function') {
        try { return String(spec(item) ?? ''); } catch { return ''; }
    }
    const one = (id: string) => formatValue(findField(fields, id), item[id]);
    if (Array.isArray(spec)) return spec.map((id) => one(id)).filter(Boolean).join(' · ');
    if (spec.includes('{')) return tidy(spec.replace(/\{([^}]+)\}/g, (_, key: string) => one(key.trim())));
    return one(spec);
};

/** Value-carrying fields in schema order, including those inside `subforms`. */
const valueFields = (fields: FormField[] = []): FormField[] =>
    fields.flatMap((f) => [
        ...(!DISPLAY_ONLY.has(f?.type || '') && fieldIdOf(f) ? [f] : []),
        ...(Array.isArray(f?.subforms) ? f.subforms.flatMap((s) => valueFields(s.data || [])) : []),
    ]);

/** Field ids a text spec reads (none for a function spec). */
const specFieldIds = (spec: CollectionTextSpec | undefined): string[] => {
    if (!spec || typeof spec === 'function') return [];
    if (Array.isArray(spec)) return spec;
    if (spec.includes('{')) return Array.from(spec.matchAll(/\{([^}]+)\}/g), (m) => m[1].trim());
    return [spec];
};

export interface ItemDetail {
    id: string;
    label: string;
    value: string;
    icon: string;
    span?: number;
}

/** Icon used in front of a detail when the JSON doesn't name one. */
const TYPE_ICONS: Record<string, string> = {
    textfield: 'notes', multitextbox: 'notes', markdown: 'notes', richtext: 'notes',
    numberfield: 'tag', numberstepper: 'tag', currency: 'payments', computed: 'functions',
    select: 'list_alt', autocomplete: 'list_alt', asyncautocomplete: 'list_alt', cascadeselect: 'list_alt',
    radio: 'radio_button_checked', chipselect: 'sell', togglebuttons: 'tune', tagsinput: 'sell',
    checkbox: 'check_circle', switch: 'toggle_on', consent: 'verified',
    datetime: 'event', datetimepicker: 'event', daterangepicker: 'date_range', timepicker: 'schedule',
    phone: 'call', intlphone: 'call', password: 'lock', otp: 'pin',
    address: 'place', geo: 'place', locationfield: 'place',
    rating: 'star', slider: 'tune', nps: 'speed', colorpicker: 'palette', fileupload: 'attach_file', signature: 'draw',
};

export const defaultIconFor = (field: FormField | undefined): string => TYPE_ICONS[field?.type || ''] || 'label';

/**
 * Everything an item card shows: its title, optional subtitle, and the
 * labelled `details` (icon + label + value) of its other filled fields — so
 * every record is readable at a glance. Fields already in the title, subtitle
 * or badge are not repeated. `display.details` lists ids or
 * `{ field, label, icon, span }` to choose and order them, or is `false`.
 */
export const describeItem = (
    item: Record<string, any>,
    config: Partial<CollectionConfig>,
    index: number,
): { title: string; subtitle: string; details: ItemDetail[] } => {
    const fields = config.fields || [];
    const display = config.display || {};
    const title = display.title
        ? resolveText(display.title, item, fields)
        : resolveText(titleFieldIds(config)[0], item, fields);
    const subtitle = display.subtitle ? resolveText(display.subtitle, item, fields) : '';
    const details = detailSpecs(config)
        .map((spec) => ({ ...spec, value: formatValue(findField(fields, spec.id), item[spec.id]) }))
        .filter((d) => d.value);
    return { title: title || `${itemLabelOf(config)} ${index + 1}`, subtitle, details };
};

/** The field ids the title shows: from `display.title`, else the first field. */
export const titleFieldIds = (config: Partial<CollectionConfig>): string[] => {
    const display = config.display || {};
    if (display.title) return specFieldIds(display.title);
    const first = valueFields(config.fields || [])[0];
    return first ? [fieldIdOf(first) as string] : [];
};

/**
 * The facts a level shows for each item (and the columns of its table view),
 * in order: `display.details` when given, else every field not already in the
 * title, subtitle or badge. Labels/icons default from the field definitions.
 */
export const detailSpecs = (config: Partial<CollectionConfig>): Omit<ItemDetail, 'value'>[] => {
    const fields = config.fields || [];
    const display = config.display || {};
    const specOf = (f: FormField | undefined, id: string, spec: Partial<CollectionDetailSpec> = {}) => ({
        id,
        label: spec.label || fieldLabel(f) || id,
        icon: spec.icon || defaultIconFor(f),
        ...(spec.span ? { span: spec.span } : {}),
    });
    if (display.details === false) return [];
    if (Array.isArray(display.details)) {
        return display.details
            .map((d) => (typeof d === 'string' ? { field: d } : d))
            .filter((d) => d && d.field)
            .map((d) => specOf(findField(fields, d.field), d.field, d));
    }
    const used = new Set<string>([...titleFieldIds(config), ...specFieldIds(display.subtitle)]);
    const badge = typeof display.badge === 'string' ? display.badge : display.badge?.field;
    if (badge) used.add(badge);
    return valueFields(fields)
        .filter((f) => !used.has(fieldIdOf(f) as string))
        .map((f) => specOf(f, fieldIdOf(f) as string));
};

/** Title + subtitle only (see `describeItem`). */
export const summarize = (item: Record<string, any>, config: Partial<CollectionConfig>, index: number) => {
    const { title, subtitle } = describeItem(item, config, index);
    return { title, subtitle };
};

/** Count every nested item under `item`, per child collection (for delete
 *  confirmations: "also removes 2 services and 1 backflow"). */
export const describeDescendants = (item: Record<string, any>, config: Partial<CollectionConfig>): string => {
    const parts = (config.collections || [])
        .map((c) => {
            const n = toItems(item?.[c.id]).length;
            return n ? `${n} ${pluralize(itemLabelOf(c), n).toLowerCase()}` : '';
        })
        .filter(Boolean);
    if (parts.length <= 1) return parts.join('');
    return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
};

/**
 * Walk a collection tree and report every level that breaks its `min`/`max`.
 * `required` (from a mandatory rule) enforces at least one root item.
 */
export const collectionIssues = (
    value: any,
    config: Partial<CollectionConfig>,
    opts: { required?: boolean; requiredMessage?: string } = {},
    path: (string | number)[] = [],
): CollectionIssue[] => {
    const items = toItems(value);
    const issues: CollectionIssue[] = [];
    const label = itemLabelOf(config).toLowerCase();
    const min = Math.max(Number(config.min) || 0, opts.required ? 1 : 0);

    if (items.length < min) {
        const message = opts.required && items.length === 0 && opts.requiredMessage
            ? opts.requiredMessage
            : config.minMessage || `Add at least ${min} ${pluralize(label, min)}`;
        issues.push({ path, message });
    }
    if (config.max != null && items.length > Number(config.max)) {
        issues.push({ path, message: config.maxMessage || `No more than ${config.max} ${pluralize(label, Number(config.max))} allowed` });
    }

    items.forEach((item, i) => {
        (config.collections || []).forEach((child) => {
            issues.push(...collectionIssues(item[child.id], child, {}, [...path, i, child.id]));
        });
    });
    return issues;
};

/** Label/value rows for the review summary, print view and PDF export.
 *  Nested items are prefixed with their parent ("Customer Location 1 › Service 2"). */
export const collectionReviewRows = (
    value: any,
    config: Partial<CollectionConfig>,
    prefix = '',
): { label: string; value: string }[] => {
    const rows: { label: string; value: string }[] = [];
    toItems(value).forEach((item, i) => {
        const label = `${prefix}${itemLabelOf(config)} ${i + 1}`;
        const { title, subtitle, details } = describeItem(item, config, i);
        const lines = [[title, subtitle].filter(Boolean).join(' — '), ...details.map((d) => `${d.label}: ${d.value}`)];
        rows.push({ label, value: lines.join('\n') });
        (config.collections || []).forEach((child) => {
            rows.push(...collectionReviewRows(item[child.id], child, `${label} › `));
        });
    });
    return rows;
};
