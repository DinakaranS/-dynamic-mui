/**
 * Schema-validation adapters. These let you validate a whole form against an
 * existing Zod / Yup object schema instead of (or in addition to) per-field
 * `rules.validation`.
 *
 * Neither `zod` nor `yup` is imported here — the resolvers duck-type the schema
 * object you pass (calling `safeParse` / `validateSync`), so those libraries are
 * never bundled. You bring your own schema instance.
 */

/** A single field error produced by a resolver. */
export interface FieldError {
    /** Field id the error belongs to (the schema key). */
    id: string;
    message: string;
    /** Originating rule/code, if the schema provides one. */
    rule?: string;
}

/** Maps the current form values to a flat list of field errors. */
export type FormResolver = (values: Record<string, any>) => FieldError[];

/**
 * Adapt a Zod object schema. Uses `safeParse` (synchronous), mapping each issue
 * to the first segment of its `path` (the field id).
 *
 * ```ts
 * import { z } from 'zod';
 * const schema = z.object({ email: z.string().email(), age: z.number().min(18) });
 * <FormGenerator ... resolver={zodResolver(schema)} />
 * ```
 */
export function zodResolver(schema: { safeParse: (v: any) => any }): FormResolver {
    return (values) => {
        const result = schema.safeParse(values);
        if (!result || result.success) return [];
        // zod v3: error.issues; some builds expose error.errors — support both.
        const issues: any[] = result.error?.issues || result.error?.errors || [];
        return issues
            .map((i) => ({ id: String(i?.path?.[0] ?? ''), message: i?.message || 'Invalid value', rule: i?.code || 'zod' }))
            .filter((e) => e.id);
    };
}

/**
 * Adapt a Yup object schema. Uses `validateSync({ abortEarly: false })` so every
 * field error is collected in one pass.
 *
 * ```ts
 * import * as yup from 'yup';
 * const schema = yup.object({ email: yup.string().email().required() });
 * <FormGenerator ... resolver={yupResolver(schema)} />
 * ```
 */
export function yupResolver(schema: { validateSync: (v: any, opts?: any) => any }): FormResolver {
    return (values) => {
        try {
            schema.validateSync(values, { abortEarly: false });
            return [];
        } catch (err: any) {
            const inner: any[] = err?.inner?.length ? err.inner : (err ? [err] : []);
            return inner
                .map((e) => ({ id: String(e?.path ?? ''), message: e?.message || 'Invalid value', rule: e?.type || 'yup' }))
                .filter((e) => e.id);
        }
    };
}
