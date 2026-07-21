import { FormField } from './helper';

/** A problem found in a form schema by `validateSchema`. */
export interface SchemaIssue {
    /** 'error' = will misbehave at runtime; 'warning' = likely a mistake. */
    level: 'error' | 'warning';
    /** Machine-readable code, e.g. 'duplicate-id'. */
    code: string;
    /** Human-readable explanation. */
    message: string;
    /** The field id involved, when applicable. */
    field?: string;
}

/** Field types that carry no user value and need no id. */
const DISPLAY_ONLY = new Set(['typography', 'divider', 'alert', 'image', 'imagelist', 'hyperlink', 'button']);

const idOf = (f: any): string | undefined => f?.id || f?.props?.id;

/** All field ids anywhere in the schema (top-level + every subform branch). */
const collectIds = (fields: FormField[], acc = new Set<string>()): Set<string> => {
    (fields || []).forEach((f: any) => {
        const id = idOf(f);
        if (id) acc.add(id);
        if (Array.isArray(f?.subforms)) f.subforms.forEach((s: any) => collectIds(s?.data || [], acc));
    });
    return acc;
};

/** Field ids referenced by a rule expression (handles all/any/none groups). */
const ruleFields = (expr: any): string[] => {
    if (!expr || typeof expr !== 'object') return [];
    if (typeof expr.field === 'string') return [expr.field];
    const group = expr.all || expr.any || expr.none;
    if (Array.isArray(group)) return group.flatMap(ruleFields);
    return [];
};

const optionValues = (opts: any): any[] =>
    (Array.isArray(opts) ? opts : []).map((o) => (typeof o === 'string' ? o : o?.value));

/**
 * Lint a form schema and return the problems found — run it in a test or a build
 * step to catch config mistakes early (returns `[]` for a clean schema).
 *
 * Detects: duplicate ids (within a sibling list), missing ids on value fields,
 * `dependsOn`/`optionsMap` mismatches and unknown targets, rule conditions
 * (`visibleWhen`/`disabledWhen`/`requiredWhen` + cross-field validators)
 * referencing non-existent fields, and subform `conditionValue`s that aren't one
 * of the driving field's options.
 */
export function validateSchema(schema: FormField[]): SchemaIssue[] {
    const issues: SchemaIssue[] = [];
    const allIds = collectIds(schema);

    const walk = (fields: FormField[]) => {
        const seen = new Set<string>();
        (fields || []).forEach((f: any) => {
            const id = idOf(f);
            const type = f?.type;

            // Missing id on a value-bearing field.
            if (!id && !DISPLAY_ONLY.has(type)) {
                issues.push({ level: 'warning', code: 'missing-id', message: `A "${type || 'field'}" has no id; its value can't be captured.` });
            }
            // Duplicate id within this sibling list (real store collision).
            if (id) {
                if (seen.has(id)) issues.push({ level: 'error', code: 'duplicate-id', field: id, message: `Duplicate field id "${id}" among siblings — their values will collide.` });
                seen.add(id);
            }

            // dependsOn / optionsMap pairing + target.
            if (f?.dependsOn && !f?.optionsMap) issues.push({ level: 'warning', code: 'depends-without-options', field: id, message: `"${id}" has \`dependsOn\` but no \`optionsMap\`, so its options never change.` });
            if (f?.optionsMap && !f?.dependsOn) issues.push({ level: 'warning', code: 'options-without-depends', field: id, message: `"${id}" has \`optionsMap\` but no \`dependsOn\`, so it can't pick a branch.` });
            if (f?.dependsOn && !allIds.has(f.dependsOn)) issues.push({ level: 'error', code: 'unknown-depends-target', field: id, message: `"${id}" dependsOn "${f.dependsOn}", which is not a field in this schema.` });

            // Rule condition targets.
            (['visibleWhen', 'disabledWhen', 'requiredWhen'] as const).forEach((key) => {
                ruleFields(f?.[key]).forEach((ref) => {
                    if (!allIds.has(ref)) issues.push({ level: 'error', code: 'unknown-rule-field', field: id, message: `"${id}" ${key} references field "${ref}", which does not exist.` });
                });
            });
            // Cross-field validators (equalsField / gtField / …).
            ((f?.rules?.validation) || []).forEach((r: any) => {
                if (r?.field && /Field$/.test(r?.rule || '') && !allIds.has(r.field)) {
                    issues.push({ level: 'error', code: 'unknown-cross-field', field: id, message: `"${id}" rule "${r.rule}" compares against "${r.field}", which does not exist.` });
                }
            });

            // Subform conditionValue should be one of the field's options.
            if (Array.isArray(f?.subforms) && f.subforms.length) {
                const opts = optionValues(f?.props?.options);
                if (opts.length) {
                    f.subforms.forEach((s: any) => {
                        if (s?.conditionValue !== undefined && !opts.includes(s.conditionValue)) {
                            issues.push({ level: 'warning', code: 'subform-condition-not-an-option', field: id, message: `"${id}" has a subform for value "${s.conditionValue}", which isn't one of its options.` });
                        }
                    });
                }
                f.subforms.forEach((s: any) => walk(s?.data || []));
            }
        });
    };

    walk(schema);
    return issues;
}
