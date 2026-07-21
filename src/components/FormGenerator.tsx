import React, { useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import { Grid, GridProps, Box, Typography, Button, Icon, CircularProgress } from '@mui/material';
import { alpha, SxProps, Theme } from '@mui/material/styles';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

// eslint-disable-next-line import/no-cycle
import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, updatePatchData, FormField } from '../util/helper';
import useUpdateEffect from '../util/useUpdateEffect';
import val from '../util/validation';
import { evaluateRule, computeFormula, CROSS_FIELD_VALIDATORS } from '../util/rules';
import { FormResolver, FieldError } from '../util/resolvers';

const LIBMap = { MUI: { map: mui } };
const response: Record<string, any> = {};

// The schema `RuleExpression` type is structurally identical to the engine's
// `RuleExpr`; this wrapper bridges the two without casting at every call site.
const evalRule = (expr: any, values: Record<string, any>): boolean => evaluateRule(expr, values);

export const FormData = <T = any>(id?: string): T => (id ? response[id] : response) as T;

export const ClearFormData = (id?: string) => {
    const responseKeys = Object.keys(response);
    if (id) {
        delete response[id];
    } else {
        responseKeys.forEach((key) => delete response[key]);
    }
};

/** Convenience accessor for a form's stored values (imperative; pairs with `guid`).
 *  Pass a values type for autocomplete: `useForm<MyValues>(guid)`. */
export const useForm = <T = Record<string, any>>(guid: string) => ({
    getValues: (): T => ({ ...(response[guid] || {}) }) as T,
    clear: () => ClearFormData(guid),
});

const MANDATORY_RULES = ['mandatory', 'mandatoryselect'];

/** True when this field is currently visible given the live values (a field with
 *  no `visibleWhen` is always visible). Hidden fields are excluded from validation. */
const isFieldVisible = (field: FormField, values: Record<string, any>) =>
    !field?.visibleWhen || evalRule(field.visibleWhen, values);

/** Field types that carry no user value — skipped in the review summary. */
const DISPLAY_ONLY_TYPES = new Set(['typography', 'divider', 'alert', 'image', 'imagelist', 'hyperlink', 'button', 'summary']);

/** Run every user-facing string in a field's props through `t` (labels,
 *  placeholders, helper text, option labels, radio labels, typography text). */
const translateProps = (props: any, t: (s: string) => string): any => {
    if (!props || typeof props !== 'object') return props;
    const out = { ...props };
    if (typeof out.text === 'string') out.text = t(out.text);
    if (typeof out.label === 'string') out.label = t(out.label);
    if (typeof out.MuiFLabel === 'string') out.MuiFLabel = t(out.MuiFLabel);
    (['MuiAttributes', 'MuiBoxAttributes', 'MuiFCLAttributes'] as const).forEach((k) => {
        if (out[k] && typeof out[k] === 'object') {
            const b = { ...out[k] };
            if (typeof b.label === 'string') b.label = t(b.label);
            if (typeof b.placeholder === 'string') b.placeholder = t(b.placeholder);
            if (typeof b.helperText === 'string') b.helperText = t(b.helperText);
            out[k] = b;
        }
    });
    const tOpt = (arr: any[]) => arr.map((o) => (o && typeof o === 'object' && typeof o.label === 'string' ? { ...o, label: t(o.label) } : o));
    if (Array.isArray(out.options)) out.options = tOpt(out.options);
    if (Array.isArray(out.MuiFCLabels)) out.MuiFCLabels = tOpt(out.MuiFCLabels);
    return out;
};

/** Human label for a field, checking the various attribute buckets controls use. */
const reviewLabel = (field: any): string => {
    const p = field?.props || {};
    return (
        p.MuiAttributes?.label ||
        p.MuiBoxAttributes?.label ||
        p.MuiFLabel ||
        p.label ||
        p.MuiFCLAttributes?.label ||
        field?.id ||
        p.id ||
        ''
    );
};

const optionLabelFor = (options: any[], val: any): string => {
    const opt = (options || []).find((o: any) => (typeof o === 'string' ? o : o?.value) === val);
    if (!opt) return String(val);
    return typeof opt === 'string' ? opt : (opt.label ?? opt.title ?? opt.value);
};

/** Resolve a stored value to a human-readable string for the review summary. */
const reviewDisplay = (field: any, value: any, liveValues: Record<string, any>): string => {
    if (value === undefined || value === null || value === '') return '';
    const type = field?.type;
    const props = field?.props || {};

    // Option-backed controls → show the option label(s), not the raw value.
    let options = props.options;
    if (field?.optionsMap && field?.dependsOn) options = field.optionsMap[liveValues[field.dependsOn]] || [];
    if (type === 'radio') options = props.MuiFCLabels;
    if (Array.isArray(options) && options.length) {
        if (Array.isArray(value)) return value.map((v) => optionLabelFor(options, v)).join(', ');
        if (typeof value === 'string' && /[;,]/.test(value)) {
            return value.split(/[;,]/).map((s) => optionLabelFor(options, s.trim())).filter(Boolean).join(', ');
        }
        return optionLabelFor(options, value);
    }

    // Boolean toggles.
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';

    if (Array.isArray(value)) return value.filter((v) => v !== '' && v != null).join(', ');
    if (typeof value === 'object') {
        try {
            const parts = Object.values(value).filter((v) => v !== '' && v != null);
            return parts.length ? parts.join(', ') : JSON.stringify(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
};

/** Build the ordered { label, value } rows for the review summary / print / PDF.
 *  Skips display-only + hidden fields and follows matching subforms. */
const buildReviewRows = (fields: FormField[], values: Record<string, any>): { label: string; value: string }[] => {
    const rows: { label: string; value: string }[] = [];
    const collect = (list: any[]) => {
        (list || []).forEach((f: any) => {
            if (DISPLAY_ONLY_TYPES.has(f?.type)) return;
            if (f?.visibleWhen && !evalRule(f.visibleWhen, values)) return;
            const fid = f?.id || f?.props?.id;
            const display = fid ? reviewDisplay(f, values[fid], values) : '';
            if (display !== '') rows.push({ label: reviewLabel(f), value: display });
            if (Array.isArray(f?.subforms)) {
                const current = fid ? values[fid] : undefined;
                f.subforms.forEach((sub: any) => {
                    const matches = Array.isArray(current) ? current.includes(sub.conditionValue) : sub.conditionValue === current;
                    if (matches) collect(sub.data || []);
                });
            }
        });
    };
    collect(fields);
    return rows;
};

const escapeHtml = (s: string): string =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

/** Print the current values (as the review summary) via the browser dialog —
 *  which also offers "Save as PDF". Dependency-free. */
const printReview = (rows: { label: string; value: string }[], title?: string) => {
    if (typeof document === 'undefined') return;
    const body = rows.length
        ? rows.map((r) => `<div class="row"><div class="lbl">${escapeHtml(r.label)}</div><div class="val">${escapeHtml(r.value)}</div></div>`).join('')
        : '<p class="empty">No values entered.</p>';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title || 'Form')}</title>
<style>
  *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;margin:32px}
  h1{font-size:18px;margin:0 0 16px} .row{display:grid;grid-template-columns:34% 1fr;gap:16px;padding:9px 0;border-bottom:1px solid #e2e8f0}
  .lbl{color:#64748b;font-weight:500;font-size:13px} .val{color:#0f172a;font-weight:600;font-size:13px;white-space:pre-wrap;word-break:break-word}
  .empty{color:#64748b} @media print{body{margin:12mm}}
</style></head><body>${title ? `<h1>${escapeHtml(title)}</h1>` : ''}${body}</body></html>`;

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const cleanup = () => { setTimeout(() => { try { document.body.removeChild(iframe); } catch { /* already gone */ } }, 500); };
    const doc = iframe.contentWindow?.document;
    if (!doc) { cleanup(); return; }
    doc.open(); doc.write(html); doc.close();
    const go = () => {
        try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        } catch { /* print unavailable (e.g. jsdom) */ }
        cleanup();
    };
    // Give the iframe a tick to lay out before printing.
    if (iframe.contentWindow) setTimeout(go, 50); else cleanup();
};

/** Generate and download a real PDF via the OPTIONAL `pdfmake` peer dependency
 *  (lazy-loaded so it never bloats the core bundle). The label/value rows are
 *  laid out as a table with automatic pagination. */
const exportReviewPdf = async (
    rows: { label: string; value: string }[],
    opts: { title?: string; filename?: string } = {},
): Promise<void> => {
    let pdfMake: any;
    let vfs: any;
    try {
        // Literal specifiers so bundlers (Vite/webpack) can resolve pdfmake when
        // it's installed. The library build marks `pdfmake` external, so it is
        // never bundled into dist — only referenced for lazy loading.
        const mod: any = await import('pdfmake/build/pdfmake');
        const fonts: any = await import('pdfmake/build/vfs_fonts');
        pdfMake = mod?.default || mod;
        // The vfs (embedded fonts) export shape has changed across pdfmake versions:
        //  - 0.2.x: `{ pdfMake: { vfs } }`
        //  - 0.3.x: `module.exports = vfs` (the font map itself → `default`)
        vfs = fonts?.pdfMake?.vfs || fonts?.vfs || fonts?.default?.pdfMake?.vfs || fonts?.default?.vfs || fonts?.default;
    } catch {
        throw new Error('exportPdf() needs the optional "pdfmake" package. Install it with: npm i pdfmake');
    }
    if (!pdfMake?.createPdf) throw new Error('exportPdf() needs the optional "pdfmake" package. Install it with: npm i pdfmake');
    if (vfs) pdfMake.vfs = vfs;

    const docDefinition = {
        content: [
            ...(opts.title ? [{ text: opts.title, fontSize: 15, bold: true, color: '#0f172a', margin: [0, 0, 0, 12] }] : []),
            rows.length
                ? {
                    table: {
                        headerRows: 0,
                        widths: ['34%', '*'],
                        body: rows.map((r) => [
                            { text: r.label, color: '#64748b', margin: [0, 3, 0, 3] },
                            { text: r.value, color: '#0f172a', bold: true, margin: [0, 3, 0, 3] },
                        ]),
                    },
                    layout: {
                        hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
                        vLineWidth: () => 0,
                        hLineColor: () => '#e2e8f0',
                        paddingLeft: () => 0,
                        paddingRight: () => 8,
                    },
                }
                : { text: 'No values entered.', color: '#64748b' },
        ],
        defaultStyle: { fontSize: 10 },
        pageMargins: [40, 40, 40, 40],
    };

    const filename = opts.filename || `${(opts.title || 'form').replace(/\s+/g, '-').toLowerCase()}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
};

/** The effective validation list for a field, injecting a mandatory rule when a
 *  `requiredWhen` condition currently holds. */
const effectiveValidation = (
    field: FormField,
    values: Record<string, any>,
    requiredMsg = 'This field is required',
): any[] => {
    const base = [...(field?.rules?.validation || [])];
    const hasMandatory = base.some((v: any) => MANDATORY_RULES.includes(v.rule));
    if (field?.requiredWhen && !hasMandatory && evalRule(field.requiredWhen, values)) {
        base.push({ rule: 'mandatory', message: field.requiredMessage || requiredMsg });
    }
    return base;
};

const getErrors = (fields: FormField[], guid: string, requiredMsg?: string, resolver?: FormResolver, asyncState?: Record<string, AsyncStatus>) => {
    const values = response[guid] || {};
    const hidden = new Set(
        (fields || [])
            .filter((f) => !isFieldVisible(f, values))
            .map((f) => f?.id || f?.props?.id)
            .filter(Boolean),
    );
    const errors = (fields || []).reduce((acc: any[], field: FormField) => {
        // Skip fields hidden by a conditional-visibility rule.
        if (!isFieldVisible(field, values)) return acc;

        const validation = effectiveValidation(field, values, requiredMsg);
        if (validation.length === 0) return acc;

        const fieldId = field?.id || field?.props?.id;
        if (!fieldId) return acc;

        const rawValue = values[fieldId];
        const fieldValue = rawValue == null ? '' : rawValue.toString();
        const fieldIsMandatory = validation.some((r: any) => MANDATORY_RULES.includes(r.rule));

        validation.forEach((rule: any) => {
            // Cross-field validators compare against another field's value.
            const crossFn = CROSS_FIELD_VALIDATORS[rule.rule];
            if (crossFn) {
                // An optional field left empty shouldn't fail a comparison (two
                // blanks → NaN → spurious error). Emptiness of a required field is
                // reported by its mandatory rule instead.
                if (!fieldValue && !fieldIsMandatory) return;
                const otherRaw = values[rule.field ?? rule.value];
                const otherValue = otherRaw == null ? '' : otherRaw.toString();
                if (!crossFn(fieldValue, otherValue)) acc.push({ ...rule, id: fieldId });
                return;
            }

            const validatorFn = val[rule.rule as keyof typeof val];
            // Skip unknown rules instead of throwing "undefined is not a function".
            if (typeof validatorFn !== 'function') return;

            const isMandatoryRule = MANDATORY_RULES.includes(rule.rule);
            // An optional field left empty is valid — only mandatory rules
            // fail on an empty value. Every other rule runs once there's a value.
            if (!fieldValue && !isMandatoryRule) return;

            const isClean = fieldValue ? validatorFn(fieldValue, rule.value) : false;
            if (!isClean) {
                acc.push({ ...rule, id: fieldId });
            }
        });
        return acc;
    }, []);

    // Merge schema-resolver (Zod/Yup) errors, skipping fields hidden by
    // `visibleWhen` so an unreachable field never blocks submit.
    if (resolver) {
        let schemaErrors: FieldError[] = [];
        try { schemaErrors = resolver(values) || []; } catch { schemaErrors = []; }
        schemaErrors.forEach((e) => {
            if (e && e.id && !hidden.has(e.id)) {
                errors.push({ id: e.id, rule: e.rule || 'schema', message: e.message });
            }
        });
    }

    // Merge async (remote) validation results — an invalid check, or one still
    // pending at submit time, blocks the submit.
    if (asyncState) {
        Object.entries(asyncState).forEach(([id, st]) => {
            if (!id || hidden.has(id) || !st) return;
            if (st.status === 'invalid') errors.push({ id, rule: 'async', message: st.message || 'Invalid' });
            else if (st.status === 'pending') errors.push({ id, rule: 'async-pending', message: 'Still validating…' });
        });
    }

    return errors;
};

export interface FormGeneratorProps {
    /** Component unique identifier */
    guid: string;
    /** Component json data */
    data: FormField[];
    /** Json data to assign value */
    patch?: Record<string, any>;
    /** Component Ref */
    formRef?: React.Ref<HTMLButtonElement>;
    /** Component Submit Function */
    onSubmit?: (response: any, errors: any[], data: FormField[], guid: string) => void;
    /** Component On Change Function */
    onChange?: (args: { id: string; value: any; option?: any }) => void;
    /** Component On Step Change Function */
    onStepChange?: (currentStep: number, isScreenChange: boolean, isLastStep: boolean) => void;
    /** Grid Container Attributes */
    MuiGridAttributes?: GridProps;
    /** Stepper Active Step */
    /** Stepper Active Step */
    activeStep?: number;
    /** On Field Click (Internal/Builder) */
    onFieldClick?: (field: FormField) => void;
    /** On Field Double Click (Internal/Builder) */
    onFieldDoubleClick?: (field: FormField) => void;
    /** On Field Context Menu (Internal/Builder) */
    onFieldContextMenu?: (event: React.MouseEvent, field: FormField) => void;
    /**
     * By default a form's stored data is removed from the shared store when the
     * component unmounts, preventing the store from growing unbounded across
     * mount/unmount cycles. Set to `true` to keep the data available via
     * `FormData(guid)` after the form has unmounted.
     */
    persistOnUnmount?: boolean;
    /** Persist form data to browser storage and restore it on mount (draft/auto-save). */
    autoSave?: boolean;
    /** Storage key for auto-save (defaults to `dynamic-mui:<guid>`). */
    autoSaveKey?: string;
    /** Which browser storage to use for auto-save (default 'local'). */
    autoSaveStorage?: 'local' | 'session';
    /** Imperative API — getValues/getErrors/validate/reset/setValues/submit. */
    apiRef?: React.Ref<FormApi<any>>;
    /** Localizable default messages (e.g. { required: 'Champ obligatoire' }). */
    messages?: FormMessages;
    /** Translate every user-facing string (labels, placeholders, helper text,
     *  option labels, validation messages, typography, submit/cancel labels).
     *  Plug in any i18n: `translate={(s) => dictionary[s] ?? s}`. */
    translate?: (text: string) => string;
    /** Show a visible validation summary above the form after a failed submit. */
    validationSummary?: boolean;
    /** Validate the whole form against a schema resolver (see `zodResolver` /
     *  `yupResolver`). Its errors merge with per-field `rules.validation` and
     *  appear in `onSubmit`, the validation summary, and `apiRef.getErrors()`. */
    resolver?: FormResolver;
    /** Per-field async (remote) validators, keyed by field id — e.g. an
     *  "is this username taken?" server check. Each returns an error message
     *  (string) or a falsy value when valid. Runs debounced on change with a
     *  pending / valid / invalid indicator, and blocks submit while pending or
     *  invalid. */
    asyncValidators?: Record<string, AsyncValidator>;
    /** Render every control disabled (non-editable) while keeping the form layout. */
    readOnly?: boolean;
    /** Warn the user (native beforeunload prompt) when they try to leave the page
     *  with unsaved edits — i.e. while the form is dirty. */
    warnOnUnsavedChanges?: boolean;
    /** Render a visible submit button with this label (runs the same submit flow).
     *  When omitted, no visible submit button is rendered (external/apiRef submit).
     *  Shortcut for `submitButton: { label }`. */
    submitLabel?: string;
    /** Fully configure the visible submit button — colour, icon, loader, variant.
     *  Takes precedence over `submitLabel`. */
    submitButton?: SubmitButtonConfig;
    /** Make the submit bar stick to the bottom of the scroll area. */
    stickySubmit?: boolean;
    /** Optional cancel/secondary action shown beside submit. */
    cancelLabel?: string;
    /** Handler for the cancel button. */
    onCancel?: () => void;
    /**
     * Render the form as a clean read-only SUMMARY of its current values
     * (label → value), instead of input controls. Respects `visibleWhen`,
     * resolves option labels/booleans/dates, and follows matching subforms.
     */
    reviewMode?: boolean;
}

/** Localizable built-in strings. */
export interface FormMessages {
    required?: string;
    /** "{n} error(s) found" summary prefix; `{n}` is replaced with the count. */
    errorSummary?: string;
}

/** Declarative styling/behaviour for the visible submit button. */
export interface SubmitButtonConfig {
    /** Button text. */
    label?: string;
    /** MUI theme palette colour, or any CSS colour string for a custom fill. */
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'inherit' | string;
    /** Two-colour gradient `[from, to]` for the button background (overrides `color`). */
    gradient?: [string, string];
    /** Leading Material icon name (e.g. `send`, `save`). */
    icon?: string;
    /** Trailing Material icon name. */
    endIcon?: string;
    /** MUI button variant. */
    variant?: 'contained' | 'outlined' | 'text';
    /** Show a spinner and disable the button. Also driven automatically while an
     *  async `onSubmit` (one that returns a Promise) is pending. */
    loading?: boolean;
    /** Text shown while loading (defaults to the label). */
    loadingLabel?: string;
    /** Stretch the button to the full width of the bar. */
    fullWidth?: boolean;
    /** Extra styles merged onto the button. */
    sx?: SxProps<Theme>;
}

const NAMED_COLORS = ['primary', 'secondary', 'success', 'error', 'warning', 'info', 'inherit'];

/** An async field validator: resolves to an error message when invalid, or a
 *  falsy value when valid. Receives the field's value and all current values. */
export type AsyncValidator = (value: any, values: Record<string, any>) => Promise<string | null | undefined | false>;

/** Live status of an async validator for a field. */
type AsyncStatus = { status: 'pending' | 'valid' | 'invalid'; message?: string };

const DEFAULT_MESSAGES: Required<FormMessages> = {
    required: 'This field is required',
    errorSummary: '{n} field(s) need attention',
};

/** Imperative handle exposed via `apiRef`. Pass a values type for full
 *  autocomplete: `useRef<FormApi<MyValues>>(null)`. */
export interface FormApi<T = Record<string, any>> {
    /** Current values for this form. */
    getValues: () => T;
    /** Run validation now and return the errors (also displays them). */
    getErrors: () => any[];
    /** Alias of getErrors that returns whether the form is valid. */
    validate: () => boolean;
    /** Merge values into the form and re-render. */
    setValues: (values: Partial<T>) => void;
    /** Clear this form's stored values. */
    reset: () => void;
    /** The values the form started with (initial patch/schema snapshot). */
    getInitialValues: () => T;
    /** True when the current values differ from the initial snapshot. */
    isDirty: () => boolean;
    /** Restore the values to the initial snapshot (undo all edits). */
    resetToInitial: () => void;
    /** Adopt the current values as the new "clean" baseline (e.g. after a save),
     *  so `isDirty()` reports false until the next edit. */
    markPristine: () => void;
    /** Programmatically submit (runs the same flow as the submit button). */
    submit: () => void;
    /** Open the browser print dialog for a clean summary of the current values
     *  (the same "review" layout). Users can also "Save as PDF" from there. */
    print: (options?: { title?: string }) => void;
    /** Download a PDF of the current values. Requires the optional `pdfmake`
     *  package (`npm i pdfmake`); lazy-loaded, so it never bloats the bundle. */
    exportPdf: (options?: { title?: string; filename?: string }) => Promise<void>;
}

/** Resolve the chosen web storage, guarding SSR / disabled-storage environments. */
const getStorage = (kind: 'local' | 'session'): Storage | null => {
    try {
        if (typeof window === 'undefined') return null;
        return kind === 'session' ? window.sessionStorage : window.localStorage;
    } catch {
        return null;
    }
};

const DEFAULT_PATCH = {};

export function FormGenerator({
    data = [],
    patch = DEFAULT_PATCH,
    guid,
    formRef,
    onSubmit,
    onChange,
    onStepChange,
    MuiGridAttributes = { spacing: 2 },
    activeStep = 0,
    onFieldClick,
    onFieldDoubleClick,
    onFieldContextMenu,
    persistOnUnmount = false,
    autoSave = false,
    autoSaveKey,
    autoSaveStorage = 'local',
    apiRef,
    messages,
    validationSummary = false,
    resolver,
    asyncValidators,
    readOnly = false,
    reviewMode = false,
    warnOnUnsavedChanges = false,
    submitLabel,
    submitButton,
    stickySubmit = false,
    cancelLabel,
    onCancel,
    translate,
}: FormGeneratorProps) {
    const saveKey = autoSaveKey || `dynamic-mui:${guid}`;
    // A safe translate function (identity when none is provided).
    const t = useCallback((s: any) => (translate && typeof s === 'string' ? translate(s) : s), [translate]);
    // Defaults, overridden by `messages`, then run through `translate`.
    const rawMsg = { ...DEFAULT_MESSAGES, ...(messages || {}) };
    const msg = { required: t(rawMsg.required), errorSummary: t(rawMsg.errorSummary) };
    const [newPatch, setNewPatch] = useState(patch);
    // Bump to force a re-render when the shared store mutates (dynamic subforms,
    // conditional UI). The counter value itself is never read.
    const [, forceRender] = useReducer((n: number) => n + 1, 0);
    // Incremented on every submit attempt — signals controls to display their
    // validation state (so untouched invalid fields turn red, not just silently error).
    const [submitTick, setSubmitTick] = useState(0);
    const [submitErrors, setSubmitErrors] = useState<any[]>([]);
    // True while an async onSubmit (returns a Promise) is pending — drives the
    // submit button's loading spinner automatically.
    const [submitting, setSubmitting] = useState(false);
    // Bumped on reset/resetToInitial to REMOUNT the controls. Controls hold their
    // own internal state and only re-sync when their incoming value is defined, so
    // clearing a field (value → undefined) wouldn't visually reset it otherwise.
    const [formVersion, setFormVersion] = useState(0);
    // Baseline snapshot of the values the form started with — the reference for
    // dirty-tracking (`isDirty` / `resetToInitial`). Captured once on mount.
    const initialValuesRef = useRef<Record<string, any> | null>(null);
    // Live-for-the-lifetime refs used to avoid setState-after-unmount and re-entrancy.
    const mountedRef = useRef(true);
    const submittingRef = useRef(false);
    // Async (remote) validation: live status per field + debounce/race bookkeeping.
    const [asyncStatus, setAsyncStatus] = useState<Record<string, AsyncStatus>>({});
    const asyncTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
    const asyncTokens = useRef<Record<string, number>>({});
    const config = LIBMap.MUI;

    // Clear pending async-validation timers and mark unmounted so late resolutions
    // (debounce timers / in-flight validator promises / async onSubmit) don't call
    // setState on an unmounted component.
    useEffect(() => () => {
        mountedRef.current = false;
        Object.values(asyncTimers.current).forEach((t) => clearTimeout(t));
        asyncTimers.current = {};
    }, []);

    // Debounced, race-safe runner for a single field's async validator.
    const runAsyncField = useCallback((fieldId: string, value: any) => {
        const validator = asyncValidators?.[fieldId];
        if (!validator || !fieldId) return;
        clearTimeout(asyncTimers.current[fieldId]);
        setAsyncStatus((s) => ({ ...s, [fieldId]: { status: 'pending' } }));
        const token = (asyncTokens.current[fieldId] || 0) + 1;
        asyncTokens.current[fieldId] = token;
        asyncTimers.current[fieldId] = setTimeout(() => {
            Promise.resolve(validator(value, response[guid] || {}))
                .then((msg) => {
                    if (!mountedRef.current || asyncTokens.current[fieldId] !== token) return; // unmounted or superseded
                    setAsyncStatus((s) => ({ ...s, [fieldId]: msg ? { status: 'invalid', message: String(msg) } : { status: 'valid' } }));
                })
                .catch(() => {
                    if (!mountedRef.current || asyncTokens.current[fieldId] !== token) return;
                    // Network/validator error → don't block the user; treat as unverified.
                    setAsyncStatus((s) => { const next = { ...s }; delete next[fieldId]; return next; });
                });
        }, 450);
    }, [asyncValidators, guid]);
    const layout = useMemo(
        () => generateLayout(updatePatchData(data, newPatch, guid, response)),
        [newPatch, data, guid],
    );

    useEffect(() => {
        if (isEmpty(response[guid])) response[guid] = { ...patch };
    }, [guid, patch]);

    // Snapshot the initial values once, after the store is seeded on first render.
    useEffect(() => {
        if (initialValuesRef.current === null) {
            initialValuesRef.current = { ...(response[guid] || {}) };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Warn on navigation away while there are unsaved edits.
    useEffect(() => {
        if (!warnOnUnsavedChanges || typeof window === 'undefined') return undefined;
        const handler = (e: BeforeUnloadEvent) => {
            const base = initialValuesRef.current;
            if (base && !isEqual(response[guid] || {}, base)) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [warnOnUnsavedChanges, guid]);

    // Re-hydrate only when the patch's CONTENT changes — not on every new object
    // reference. Parents commonly pass an inline `patch={{...}}` literal (a fresh
    // reference each render); keying on identity would re-apply the patch on every
    // parent re-render and silently clobber the user's in-progress edits.
    const patchKey = useMemo(() => {
        try { return JSON.stringify(patch); } catch { return String(patch); }
    }, [patch]);
    useUpdateEffect(() => {
        setNewPatch({ ...patch });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [patchKey]);

    // Free this form's slice of the shared store on unmount so the module-level
    // `response` object doesn't leak entries across mount/unmount cycles.
    // Opt out with `persistOnUnmount` when data must outlive the component.
    useEffect(() => {
        if (persistOnUnmount) return undefined;
        return () => {
            delete response[guid];
        };
    }, [guid, persistOnUnmount]);

    // Auto-save: restore a saved draft into the store on mount.
    useEffect(() => {
        if (!autoSave) return;
        const storage = getStorage(autoSaveStorage);
        if (!storage) return;
        try {
            const saved = storage.getItem(saveKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                response[guid] = { ...response[guid], ...parsed };
                setNewPatch((prev) => ({ ...prev, ...parsed }));
                // Re-baseline the dirty-tracking snapshot to include the restored draft,
                // otherwise a freshly-restored form reads as "dirty" with zero edits.
                initialValuesRef.current = { ...(response[guid] || {}) };
            }
        } catch {
            /* ignore malformed drafts */
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSave, saveKey, autoSaveStorage, guid]);

    const persistDraft = useCallback(() => {
        if (!autoSave) return;
        const storage = getStorage(autoSaveStorage);
        if (!storage) return;
        try {
            storage.setItem(saveKey, JSON.stringify(response[guid] || {}));
        } catch {
            /* storage full / unavailable — ignore */
        }
    }, [autoSave, autoSaveStorage, saveKey, guid]);

    const onUpdate = useCallback(({ id, value, option }: any) => {
        if (!response[guid]) response[guid] = {};
        response[guid][id] = value;

        // Clear values that are no longer reachable so stale data from a field the
        // user can't see doesn't linger in the response/submit:
        //  - fields hidden by `visibleWhen`
        //  - fields inside a `subforms` branch that no longer matches (keeping ids
        //    that are also present in the matching branch, e.g. a shared field id).
        const values = response[guid];
        data.forEach((f: FormField) => {
            const fid = f?.id || f?.props?.id;
            if (fid && f.visibleWhen && !evalRule(f.visibleWhen, values)) {
                delete values[fid];
            }
            if (Array.isArray(f.subforms) && f.subforms.length) {
                const current = fid ? values[fid] : undefined;
                const matchIds = new Set<string>();
                const otherIds = new Set<string>();
                f.subforms.forEach((sub: any) => {
                    const matches = Array.isArray(current) ? current.includes(sub.conditionValue) : sub.conditionValue === current;
                    (sub.data || []).forEach((sf: FormField) => {
                        const sfid = sf?.id || sf?.props?.id;
                        if (sfid) (matches ? matchIds : otherIds).add(sfid);
                    });
                });
                otherIds.forEach((sfid) => { if (!matchIds.has(sfid)) delete values[sfid]; });
            }
            // Dynamic options: drop a now-invalid selection when the parent changed.
            if (fid && f.optionsMap && f.dependsOn) {
                const opts = f.optionsMap[values[f.dependsOn]] || [];
                const valid = opts.map((o: any) => (typeof o === 'string' ? o : o?.value));
                const cur = values[fid];
                if (cur != null && cur !== '' && !valid.includes(cur)) delete values[fid];
            }
        });

        // Recompute formula fields NOW so their stored value is current immediately.
        // (The render pass also computes them, but reads via onChange/getValues can
        // happen before that re-render — leaving a stale computed value otherwise.)
        data.forEach((f: FormField) => {
            const fid = f?.id || f?.props?.id;
            if (fid && f.formula) values[fid] = computeFormula(f.formula, values);
        });

        // Trigger re-render to evaluate dynamic subforms and UI rules
        forceRender();
        persistDraft();

        // Kick off this field's async (remote) validator, debounced.
        if (asyncValidators?.[id]) runAsyncField(id, value);

        if (typeof onChange === 'function') {
            onChange({ id, value, option });
        }
    }, [guid, onChange, persistDraft, data, asyncValidators, runAsyncField]);

    // Move focus/scroll to the first field that failed validation.
    const focusFirstError = useCallback((errors: any[]) => {
        const firstId = errors?.[0]?.id;
        if (!firstId || typeof document === 'undefined') return;
        const el = document.getElementById(firstId)
            || document.querySelector(`[name="${firstId}"]`)
            || document.getElementById(`${guid}-${firstId}`);
        if (el) {
            (el as HTMLElement).scrollIntoView?.({ behavior: 'smooth', block: 'center' });
            (el as HTMLElement).focus?.();
        }
    }, [guid]);

    const runValidation = useCallback(() => {
        const errors = (getErrors(data, guid, msg.required, resolver, asyncStatus) || []).map((e: any) => (translate && e?.message ? { ...e, message: t(e.message) } : e));
        setSubmitErrors(errors);
        // Tell every control to display its validation state (turn invalid fields red).
        setSubmitTick((t) => t + 1);
        return errors;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, guid, msg.required, resolver, asyncStatus]);

    const handleSubmit = useCallback((submitCallback: any, formData: any, formGuid: any) => {
        // Don't re-enter while an async onSubmit is still pending (double-submit guard).
        if (submittingRef.current) return;
        const errors = (getErrors(formData, formGuid, msg.required, resolver, asyncStatus) || []).map((e: any) => (translate && e?.message ? { ...e, message: t(e.message) } : e));
        setSubmitErrors(errors);
        setSubmitTick((t) => t + 1);
        if (errors.length) focusFirstError(errors);
        if (typeof submitCallback === 'function') {
            const result = submitCallback(response, errors, formData, formGuid);
            // If the handler is async, drive the submit button's loader until it settles.
            if (result && typeof result.then === 'function') {
                submittingRef.current = true;
                setSubmitting(true);
                Promise.resolve(result).finally(() => {
                    submittingRef.current = false;
                    if (mountedRef.current) setSubmitting(false);
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusFirstError, msg.required, resolver, asyncStatus]);

    useImperativeHandle(apiRef, (): FormApi<any> => ({
        getValues: () => ({ ...(response[guid] || {}) }),
        getErrors: () => runValidation(),
        validate: () => runValidation().length === 0,
        setValues: (values) => {
            response[guid] = { ...(response[guid] || {}), ...(values || {}) };
            setNewPatch((prev) => ({ ...prev, ...(values || {}) }));
        },
        reset: () => {
            delete response[guid];
            setNewPatch({});
            setSubmitErrors([]);
            setFormVersion((v) => v + 1);
            forceRender();
        },
        submit: () => handleSubmit(onSubmit, data, guid),
        getInitialValues: () => ({ ...(initialValuesRef.current || {}) }),
        isDirty: () => !isEqual(response[guid] || {}, initialValuesRef.current || {}),
        resetToInitial: () => {
            response[guid] = { ...(initialValuesRef.current || {}) };
            setNewPatch({ ...(initialValuesRef.current || {}) });
            setSubmitErrors([]);
            setFormVersion((v) => v + 1);
            forceRender();
        },
        markPristine: () => { initialValuesRef.current = { ...(response[guid] || {}) }; },
        print: (options) => printReview(buildReviewRows(data, response[guid] || {}), options?.title),
        exportPdf: (options) => exportReviewPdf(buildReviewRows(data, response[guid] || {}), options),
    }), [apiRef, guid, runValidation, handleSubmit, onSubmit, data]);

    const onStepUpdate = (currentStep: number, isScreenChange: boolean, isLastStep: boolean) => {
        if (typeof onStepChange === 'function') {
            onStepChange(currentStep, isScreenChange, isLastStep);
        }
    };

    const renderDynamicComponent = (field: FormField, index: number) => {
        const { type = '', style = {}, className = '', visible = false, rules = {}, subforms = [] } = field;
        const cProps = field.props || {};
        const cLayout = field.layout || {};
        const fieldId = field?.id || cProps?.id;
        const configObj = config.map[type] || {};
        const { options = {} } = configObj;

        // Live values drive all reactive rules; recomputed on every forceRender.
        const liveValues = response[guid] || {};

        // 1. Conditional visibility — hidden fields render nothing at all, and
        //    their stored value is cleared so it doesn't linger in the response
        //    (also covers fields hidden on the initial render).
        if (field.visibleWhen && !evalRule(field.visibleWhen, liveValues)) {
            if (fieldId && response[guid] && response[guid][fieldId] !== undefined) {
                delete response[guid][fieldId];
            }
            return null;
        }

        // Ensure the control emits onChange with the SAME id the store is keyed by
        // (`field.id || props.id`). Without this, a schema that sets the id only at
        // the top level (`field.id`) makes the control emit an empty id, so edits
        // land under the wrong key and never appear in the response.
        let effectiveProps: any = fieldId ? { ...cProps, id: fieldId } : cProps;

        // Always feed the LIVE store value into the control. The layout is memoized,
        // so its cached `props.value` is the first-mount snapshot; when a control
        // remounts (e.g. toggling review mode, or a reset bumping the key), it must
        // re-read the current value from the store — not the stale snapshot — or the
        // typed data would vanish from the display while still living in the store.
        if (fieldId && liveValues[fieldId] !== undefined) {
            effectiveProps = { ...effectiveProps, value: liveValues[fieldId] };
        }

        // 2. Computed / formula field — derive the value, store it (so it submits),
        //    and feed it into the control's props.
        if (field.formula && fieldId) {
            const computed = computeFormula(field.formula, liveValues);
            if (response[guid]) response[guid][fieldId] = computed;
            effectiveProps = { ...effectiveProps, value: computed };
        }

        // 3. Enable/disable rule (also honours the form-wide `readOnly` flag).
        if (readOnly || (field.disabledWhen && evalRule(field.disabledWhen, liveValues))) {
            effectiveProps = {
                ...effectiveProps,
                MuiAttributes: { ...(effectiveProps.MuiAttributes || {}), disabled: true },
                MuiBoxAttributes: { ...(effectiveProps.MuiBoxAttributes || {}), disabled: true },
                MuiFCLAttributes: { ...(effectiveProps.MuiFCLAttributes || {}), disabled: true },
            };
        }

        // 3b. Dynamic options — resolve this field's options from another field's
        //     value (one control, options change) instead of duplicating fields.
        if (field.optionsMap && field.dependsOn) {
            const parentVal = liveValues[field.dependsOn];
            const dynOptions = field.optionsMap[parentVal] || [];
            effectiveProps = { ...effectiveProps, options: dynOptions };
        }

        // 4. Conditional required — inject a mandatory rule when the condition holds.
        let effectiveRules = rules;
        if (field.requiredWhen && evalRule(field.requiredWhen, liveValues)) {
            const hasMandatory = rules?.validation?.some((v: any) => MANDATORY_RULES.includes(v.rule));
            if (!hasMandatory) {
                effectiveRules = {
                    ...rules,
                    validation: [
                        ...(rules.validation || []),
                        { rule: 'mandatory', message: field.requiredMessage || msg.required },
                    ],
                };
            }
        }

        // 5. i18n — translate every user-facing string in the props and the
        //    validation messages (identity no-op when no `translate` is given).
        if (translate) {
            effectiveProps = translateProps(effectiveProps, t);
            if (effectiveRules?.validation) {
                effectiveRules = {
                    ...effectiveRules,
                    validation: effectiveRules.validation.map((r: any) => (r?.message ? { ...r, message: t(r.message) } : r)),
                };
            }
        }

        // Find if any subform condition matches the current value
        const currentValue = fieldId ? response[guid]?.[fieldId] : undefined;
        const matchedSubform = subforms.find((sub) => {
            // Handle arrays (e.g., from multiple Select)
            if (Array.isArray(currentValue)) {
                return currentValue.includes(sub.conditionValue);
            }
            // Strict equality for strings/booleans
            return sub.conditionValue === currentValue;
        });

        return (
            <Grid
                key={fieldId || `layout-comp-${index}`}
                style={{
                    ...style,
                    cursor: onFieldClick ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'background-color 0.2s, box-shadow 0.2s',
                    borderRadius: 4
                }}
                {...cLayout}
                className={`${className} ${visible ? 'show' : 'hidden'}`}
                onDoubleClick={(e) => {
                    if (onFieldDoubleClick) {
                        e.stopPropagation();
                        onFieldDoubleClick(field);
                    }
                }}
                onContextMenu={(e) => {
                    if (onFieldContextMenu) {
                        e.preventDefault(); // stop the native browser context menu
                        e.stopPropagation();
                        onFieldContextMenu(e, field);
                    }
                }}
            >
                <DynamicComponent
                    key={`dynamic-comp-${fieldId || index}-${formVersion}`}
                    type={type}
                    map={configObj.map}
                    option={options.type || ''}
                    control={field}
                    attributes={effectiveProps}
                    rules={effectiveRules}
                    onChange={onUpdate}
                    onStepUpdate={onStepUpdate}
                    currentStep={activeStep}
                    patch={patch}
                    submitTick={submitTick}
                    messages={msg}
                />
                {fieldId && asyncStatus[fieldId] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, ml: 0.25 }}>
                        {asyncStatus[fieldId].status === 'pending' && (
                            <>
                                <CircularProgress size={13} thickness={5} />
                                <Typography variant="caption" color="text.secondary">Checking…</Typography>
                            </>
                        )}
                        {asyncStatus[fieldId].status === 'valid' && (
                            <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <Icon sx={{ fontSize: 15 }}>check_circle</Icon>Available
                            </Typography>
                        )}
                        {asyncStatus[fieldId].status === 'invalid' && (
                            <Typography variant="caption" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                <Icon sx={{ fontSize: 15 }}>error</Icon>{asyncStatus[fieldId].message}
                            </Typography>
                        )}
                    </Box>
                )}
                {matchedSubform && matchedSubform.data && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider', width: '100%' }}>
                        <FormGenerator
                            // Branch-specific guid + key: each subform branch gets its OWN
                            // store and remounts when the driver switches branches. Without
                            // this, branches shared one store, so a previous branch's values
                            // lingered and RE-APPEARED on switch-back — showing stale data in
                            // the UI while the parent store had already cleared it.
                            key={`${guid}-subform-${fieldId}-${String(matchedSubform.conditionValue)}`}
                            guid={`${guid}-subform-${fieldId}-${String(matchedSubform.conditionValue)}`}
                            data={matchedSubform.data}
                            patch={patch} // Pass down the patch to hydrate subform values
                            onChange={onUpdate} // Bubble up changes to the same parent form handler
                            MuiGridAttributes={{ spacing: 1 }}
                        />
                    </Box>
                )}
            </Grid >
        );
    };

    const summaryText = submitErrors.length
        ? msg.errorSummary.replace('{n}', String(submitErrors.length))
        : '';

    // Read-only SUMMARY view: label → value rows, skipping display-only and
    // hidden fields, following matching subforms. No inputs are rendered.
    if (reviewMode) {
        const rows = buildReviewRows(data, response[guid] || {});

        return (
            <Box className="dmui-review" sx={{ width: '100%' }}>
                {rows.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No values entered.</Typography>
                ) : (
                    rows.map((r, i) => (
                        <Box
                            key={`review-${i}`}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 34%) 1fr' },
                                gap: { xs: 0.25, sm: 2 },
                                py: 1.1,
                                borderBottom: i < rows.length - 1 ? '1px solid' : 'none',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{t(r.label)}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{t(r.value)}</Typography>
                        </Box>
                    ))
                )}
            </Box>
        );
    }

    return (
        <>
            {/* Screen-reader announcement of validation results (visually hidden). */}
            <Box
                aria-live="polite"
                sx={{
                    position: 'absolute', width: 1, height: 1, p: 0, m: -1,
                    overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0,
                }}
            >
                {summaryText}
            </Box>

            {validationSummary && submitErrors.length > 0 && (
                <Box
                    role="alert"
                    sx={{
                        mb: 2, p: 1.5, borderRadius: 1.5,
                        bgcolor: 'error.light', color: 'error.contrastText',
                        border: '1px solid', borderColor: 'error.main', fontSize: '0.875rem', fontWeight: 500,
                    }}
                >
                    {summaryText}
                </Box>
            )}

            <Grid key={`layout-grid-${guid}`} container {...MuiGridAttributes}>
                {layout.wrows.map((row, rowIndex) => (
                    <React.Fragment key={`row-${rowIndex}`}>
                        {row.map(renderDynamicComponent)}
                    </React.Fragment>
                ))}
            </Grid>
            {layout.worows.length > 0 && (
                <Grid key={`layout-grid-worows-${guid}`} container {...MuiGridAttributes}>
                    {layout.worows.map((field, index) => renderDynamicComponent(field, index))}
                </Grid>
            )}
            {(() => {
                const cfg: SubmitButtonConfig | null = submitButton || (submitLabel ? { label: submitLabel } : null);
                if (!cfg || readOnly) return null;

                const loading = submitting || !!cfg.loading;
                const rawColor = cfg.color;
                const isNamed = !!rawColor && NAMED_COLORS.includes(rawColor);
                const btnColor: any = isNamed ? rawColor : 'primary';
                const label = t(loading ? (cfg.loadingLabel || cfg.label || 'Submitting…') : (cfg.label || 'Submit'));

                return (
                    <Box
                        sx={(theme) => {
                            const accent = cfg.gradient?.[0]
                                || (isNamed && rawColor !== 'inherit' ? (theme.palette as any)[rawColor as string].main : undefined)
                                || (rawColor && !isNamed ? rawColor : theme.palette.primary.main);
                            const customFill: any = cfg.gradient
                                ? { background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`, color: '#fff', '&:hover': { background: `linear-gradient(135deg, ${cfg.gradient[0]}, ${cfg.gradient[1]})`, filter: 'brightness(1.06)' } }
                                : (rawColor && !isNamed ? { bgcolor: rawColor, color: '#fff', '&:hover': { bgcolor: rawColor, filter: 'brightness(1.06)' } } : {});
                            return {
                                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.25,
                                ...(stickySubmit
                                    ? {
                                        position: 'sticky', bottom: 0, zIndex: 3, py: 1.5, px: 2, mt: 2,
                                        bgcolor: alpha(theme.palette.background.paper, 0.82),
                                        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                        boxShadow: `0 -10px 26px -18px ${alpha(theme.palette.common.black, 0.5)}`,
                                    }
                                    : { pt: 1, mt: 2.5 }),
                                '& .dmui-submit': {
                                    textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.9, letterSpacing: '0.01em',
                                    ...((cfg.variant ?? 'contained') === 'contained' ? { boxShadow: `0 8px 18px -8px ${alpha(accent as string, 0.6)}` } : {}),
                                    transition: 'transform .16s ease, box-shadow .16s ease, filter .16s ease',
                                    '&:hover': { transform: 'translateY(-1px)', ...((cfg.variant ?? 'contained') === 'contained' ? { boxShadow: `0 12px 24px -8px ${alpha(accent as string, 0.72)}` } : {}) },
                                    '&:active': { transform: 'translateY(0)' },
                                    ...((cfg.variant ?? 'contained') === 'contained' ? customFill : {}),
                                },
                            };
                        }}
                    >
                        {submitErrors.length > 0 && (
                            <Typography variant="caption" sx={{ mr: 'auto', display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', fontWeight: 600 }}>
                                <Icon fontSize="small">error_outline</Icon>
                                {msg.errorSummary.replace('{n}', String(submitErrors.length))}
                            </Typography>
                        )}
                        {cancelLabel && (
                            <Button
                                variant="outlined"
                                disabled={loading}
                                onClick={() => onCancel?.()}
                                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2.5, px: 2.5, py: 0.9, borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.disabled', bgcolor: 'action.hover' } }}
                            >
                                {t(cancelLabel)}
                            </Button>
                        )}
                        <Button
                            className="dmui-submit"
                            variant={cfg.variant || 'contained'}
                            color={btnColor}
                            disableElevation
                            fullWidth={cfg.fullWidth}
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : (cfg.icon ? <Icon>{cfg.icon}</Icon> : undefined)}
                            endIcon={!loading && cfg.endIcon ? <Icon>{cfg.endIcon}</Icon> : undefined}
                            onClick={() => handleSubmit(onSubmit, data, guid)}
                            sx={cfg.sx}
                        >
                            {label}
                        </Button>
                    </Box>
                );
            })()}
            <button
                aria-label="button"
                type="button"
                ref={formRef || null}
                onClick={() => handleSubmit(onSubmit, data, guid)}
                style={{ display: 'none' }}
            />
        </>
    );
}


