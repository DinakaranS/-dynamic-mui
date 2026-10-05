import { useCallback, useMemo, useRef, useState } from 'react';
import isEqual from 'lodash/isEqual';
import { FormField } from './helper';
import { evaluateRule, computeFormula, CROSS_FIELD_VALIDATORS } from './rules';
import Validation from './validation';
import { FormResolver, FieldError } from './resolvers';

const MANDATORY_RULES = ['mandatory', 'mandatoryselect'];

/** The fully-resolved state of one field, ready for a consumer to render. */
export interface FieldState {
    /** Field id (`field.id` or `field.props.id`). */
    id: string;
    /** The original schema field. */
    field: FormField;
    /** Current value (a computed field returns its formula result). */
    value: any;
    /** False when a `visibleWhen` rule hides it. */
    visible: boolean;
    /** True when a `disabledWhen` rule holds. */
    disabled: boolean;
    /** True when it has a mandatory rule or a satisfied `requiredWhen`. */
    required: boolean;
    /** Resolved options (dynamic `dependsOn`/`optionsMap` applied). */
    options?: any[];
    /** First error message for this field, if any (populated after validate/submit). */
    error?: string;
}

export interface UseFormEngineOptions {
    /** Seed values (merged over schema `props.value` defaults). */
    initialValues?: Record<string, any>;
    /** Whole-form schema validation (see `zodResolver`/`yupResolver`). */
    resolver?: FormResolver;
    /** Localizable messages (currently: the default required message). */
    messages?: { required?: string };
}

export interface FormEngine {
    /** Current values, keyed by field id. */
    values: Record<string, any>;
    /** Errors from the last `validate()`/`submit()`. */
    errors: FieldError[];
    /** Every currently-active field (top-level + matching subform branches) with resolved state. */
    fields: FieldState[];
    /** Only the fields that should render right now (active AND visible). */
    visibleFields: FieldState[];
    /** Resolved state for one field id. */
    getFieldState: (id: string) => FieldState | undefined;
    /** Set one field's value (clears now-unreachable fields + recomputes formulas). */
    setValue: (id: string, value: any) => void;
    /** Merge several values at once. */
    setValues: (patch: Record<string, any>) => void;
    /** Run validation now; returns (and stores) the errors. */
    validate: () => FieldError[];
    /** True when the last validation found no errors. */
    isValid: boolean;
    /** True when values differ from the initial snapshot. */
    isDirty: boolean;
    /** Restore the initial values and clear errors. */
    reset: () => void;
    /** Validate; if clean, call `onValid(values)`. Returns the errors either way. */
    submit: (onValid?: (values: Record<string, any>) => void) => FieldError[];
}

/** Flatten the schema into the fields that are ACTIVE for the given values —
 *  top-level fields plus the fields of any matching `subforms` branch (recursive). */
const flattenActive = (fields: FormField[], values: Record<string, any>): FormField[] => {
    const out: FormField[] = [];
    (fields || []).forEach((f: any) => {
        out.push(f);
        if (Array.isArray(f.subforms) && f.subforms.length) {
            const id = f?.id || f?.props?.id;
            const cur = id ? values[id] : undefined;
            f.subforms.forEach((sub: any) => {
                const matches = Array.isArray(cur) ? cur.includes(sub.conditionValue) : sub.conditionValue === cur;
                if (matches) out.push(...flattenActive(sub.data || [], values));
            });
        }
    });
    return out;
};

const fieldId = (f: any): string => f?.id || f?.props?.id || '';
const isVisible = (f: any, values: Record<string, any>) => !f?.visibleWhen || evaluateRule(f.visibleWhen, values);
const resolveOptions = (f: any, values: Record<string, any>) =>
    (f?.optionsMap && f?.dependsOn) ? (f.optionsMap[values[f.dependsOn]] || []) : f?.props?.options;

/**
 * Headless form engine. Drives the same dynamic rules as `<FormGenerator>`
 * (visibleWhen / disabledWhen / requiredWhen / formula / dependsOn+optionsMap /
 * subforms / validation / resolver) but renders NOTHING — you map over
 * `visibleFields` and render your own components, calling `setValue`.
 *
 * ```tsx
 * const form = useFormEngine(schema);
 * return form.visibleFields.map((f) => (
 *   <MyInput key={f.id} label={f.field.props.MuiAttributes?.label}
 *     value={f.value} required={f.required} disabled={f.disabled}
 *     options={f.options} error={f.error}
 *     onChange={(v) => form.setValue(f.id, v)} />
 * ));
 * ```
 */
export function useFormEngine(schema: FormField[], options: UseFormEngineOptions = {}): FormEngine {
    const { resolver } = options;
    const requiredMsg = options.messages?.required || 'This field is required';

    const seed = useMemo(() => {
        const v: Record<string, any> = { ...(options.initialValues || {}) };
        flattenActive(schema, v).forEach((f) => {
            const id = fieldId(f);
            const sv = (f as any)?.props?.value;
            if (id && v[id] === undefined && sv !== undefined) v[id] = sv;
        });
        return v;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [values, setValuesState] = useState<Record<string, any>>(seed);
    const [errors, setErrors] = useState<FieldError[]>([]);
    const initialRef = useRef<Record<string, any>>(seed);

    // Reconcile the store after a change: clear hidden fields, drop now-invalid
    // dependent selections and unreachable subform ids, then recompute formulas.
    const reconcile = useCallback((next: Record<string, any>): Record<string, any> => {
        const v = { ...next };
        const active = flattenActive(schema, v);
        active.forEach((f: any) => {
            const id = fieldId(f);
            if (id && f.visibleWhen && !evaluateRule(f.visibleWhen, v)) delete v[id];
            if (id && f.optionsMap && f.dependsOn) {
                const opts = f.optionsMap[v[f.dependsOn]] || [];
                const valid = opts.map((o: any) => (typeof o === 'string' ? o : o?.value));
                const cur = v[id];
                if (cur != null && cur !== '' && !valid.includes(cur)) delete v[id];
            }
        });
        // Drop values whose subform branch no longer matches.
        (schema || []).forEach((f: any) => {
            if (!Array.isArray(f.subforms) || !f.subforms.length) return;
            const id = fieldId(f);
            const cur = id ? v[id] : undefined;
            const matchIds = new Set<string>();
            const otherIds = new Set<string>();
            f.subforms.forEach((sub: any) => {
                const matches = Array.isArray(cur) ? cur.includes(sub.conditionValue) : sub.conditionValue === cur;
                (sub.data || []).forEach((sf: any) => { const sid = fieldId(sf); if (sid) (matches ? matchIds : otherIds).add(sid); });
            });
            otherIds.forEach((sid) => { if (!matchIds.has(sid)) delete v[sid]; });
        });
        // Recompute formula fields.
        flattenActive(schema, v).forEach((f: any) => {
            const id = fieldId(f);
            if (id && f.formula) v[id] = computeFormula(f.formula, v);
        });
        return v;
    }, [schema]);

    const setValue = useCallback((id: string, value: any) => {
        setValuesState((prev) => reconcile({ ...prev, [id]: value }));
    }, [reconcile]);

    const setValues = useCallback((patch: Record<string, any>) => {
        setValuesState((prev) => reconcile({ ...prev, ...(patch || {}) }));
    }, [reconcile]);

    // Compute errors purely (does not touch state) — used by validate/submit.
    const computeErrors = useCallback((vals: Record<string, any>): FieldError[] => {
        const active = flattenActive(schema, vals);
        const acc: FieldError[] = [];
        const hidden = new Set<string>();
        active.forEach((f: any) => { const id = fieldId(f); if (id && !isVisible(f, vals)) hidden.add(id); });

        active.forEach((f: any) => {
            const id = fieldId(f);
            if (!id || hidden.has(id)) return;
            const validation = [...((f?.rules?.validation) || [])];
            const hasMandatory = validation.some((r: any) => MANDATORY_RULES.includes(r.rule));
            if (f.requiredWhen && !hasMandatory && evaluateRule(f.requiredWhen, vals)) {
                validation.push({ rule: 'mandatory', message: f.requiredMessage || requiredMsg });
            }
            if (!validation.length) return;
            const raw = vals[id];
            const fieldValue = raw == null ? '' : String(raw);
            const isMandatoryField = validation.some((r: any) => MANDATORY_RULES.includes(r.rule));
            validation.forEach((rule: any) => {
                const cross = CROSS_FIELD_VALIDATORS[rule.rule as keyof typeof CROSS_FIELD_VALIDATORS];
                if (cross) {
                    if (!fieldValue && !isMandatoryField) return;
                    const other = vals[rule.field ?? rule.value];
                    const otherVal = other == null ? '' : String(other);
                    if (!cross(fieldValue, otherVal)) acc.push({ id, rule: rule.rule, message: rule.message });
                    return;
                }
                const fn = (Validation as any)[rule.rule];
                if (typeof fn !== 'function') return;
                const isMand = MANDATORY_RULES.includes(rule.rule);
                if (!fieldValue && !isMand) return;
                const ok = isMand ? fn(raw, rule.value) : fn(fieldValue, rule.value);
                if (!ok) acc.push({ id, rule: rule.rule, message: rule.message || (isMand ? requiredMsg : '') });
            });
        });

        if (resolver) {
            let schemaErrors: FieldError[] = [];
            try { schemaErrors = resolver(vals) || []; } catch { schemaErrors = []; }
            schemaErrors.forEach((e) => { if (e && e.id && !hidden.has(e.id)) acc.push({ id: e.id, rule: e.rule || 'schema', message: e.message }); });
        }
        return acc;
    }, [schema, resolver, requiredMsg]);

    const validate = useCallback(() => {
        const errs = computeErrors(values);
        setErrors(errs);
        return errs;
    }, [computeErrors, values]);

    const submit = useCallback((onValid?: (v: Record<string, any>) => void) => {
        const errs = computeErrors(values);
        setErrors(errs);
        if (errs.length === 0 && onValid) onValid({ ...values });
        return errs;
    }, [computeErrors, values]);

    const reset = useCallback(() => {
        setValuesState({ ...initialRef.current });
        setErrors([]);
    }, []);

    // Derived, resolved field states (re-computed when values or errors change).
    const fields = useMemo<FieldState[]>(() => {
        const errBy = new Map<string, string>();
        errors.forEach((e) => { if (e.id && !errBy.has(e.id)) errBy.set(e.id, e.message); });
        return flattenActive(schema, values).map((f: any) => {
            const id = fieldId(f);
            const hasMandatory = ((f?.rules?.validation) || []).some((r: any) => MANDATORY_RULES.includes(r.rule));
            const required = hasMandatory || !!(f.requiredWhen && evaluateRule(f.requiredWhen, values));
            const value = f.formula ? computeFormula(f.formula, values) : values[id];
            return {
                id,
                field: f,
                value,
                visible: isVisible(f, values),
                disabled: !!(f.disabledWhen && evaluateRule(f.disabledWhen, values)),
                required,
                options: resolveOptions(f, values),
                error: errBy.get(id),
            } as FieldState;
        });
    }, [schema, values, errors]);

    const visibleFields = useMemo(() => fields.filter((f) => f.visible), [fields]);
    const getFieldState = useCallback((id: string) => fields.find((f) => f.id === id), [fields]);
    const isDirty = useMemo(() => !isEqual(values, initialRef.current), [values]);

    return {
        values,
        errors,
        fields,
        visibleFields,
        getFieldState,
        setValue,
        setValues,
        validate,
        isValid: errors.length === 0,
        isDirty,
        reset,
        submit,
    };
}
