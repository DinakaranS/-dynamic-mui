import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { Grid, GridProps, Box } from '@mui/material';
import isEmpty from 'lodash/isEmpty';

// eslint-disable-next-line import/no-cycle
import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, updatePatchData, FormField } from '../util/helper';
import useUpdateEffect from '../util/useUpdateEffect';
import val from '../util/validation';
import { evaluateRule, computeFormula, CROSS_FIELD_VALIDATORS } from '../util/rules';

const LIBMap = { MUI: { map: mui } };
const response: Record<string, any> = {};

// The schema `RuleExpression` type is structurally identical to the engine's
// `RuleExpr`; this wrapper bridges the two without casting at every call site.
const evalRule = (expr: any, values: Record<string, any>): boolean => evaluateRule(expr, values);

export const FormData = (id?: string) => (id ? response[id] : response);

export const ClearFormData = (id?: string) => {
    const responseKeys = Object.keys(response);
    if (id) {
        delete response[id];
    } else {
        responseKeys.forEach((key) => delete response[key]);
    }
};

const MANDATORY_RULES = ['mandatory', 'mandatoryselect'];

/** True when this field is currently visible given the live values (a field with
 *  no `visibleWhen` is always visible). Hidden fields are excluded from validation. */
const isFieldVisible = (field: FormField, values: Record<string, any>) =>
    !field?.visibleWhen || evalRule(field.visibleWhen, values);

/** The effective validation list for a field, injecting a mandatory rule when a
 *  `requiredWhen` condition currently holds. */
const effectiveValidation = (field: FormField, values: Record<string, any>): any[] => {
    const base = [...(field?.rules?.validation || [])];
    const hasMandatory = base.some((v: any) => MANDATORY_RULES.includes(v.rule));
    if (field?.requiredWhen && !hasMandatory && evalRule(field.requiredWhen, values)) {
        base.push({ rule: 'mandatory', message: field.requiredMessage || 'This field is required' });
    }
    return base;
};

const getErrors = (fields: FormField[], guid: string) => {
    const values = response[guid] || {};
    return fields?.reduce((acc: any[], field: FormField) => {
        // Skip fields hidden by a conditional-visibility rule.
        if (!isFieldVisible(field, values)) return acc;

        const validation = effectiveValidation(field, values);
        if (validation.length === 0) return acc;

        const fieldId = field?.id || field?.props?.id;
        if (!fieldId) return acc;

        const rawValue = values[fieldId];
        const fieldValue = rawValue == null ? '' : rawValue.toString();

        validation.forEach((rule: any) => {
            // Cross-field validators compare against another field's value.
            const crossFn = CROSS_FIELD_VALIDATORS[rule.rule];
            if (crossFn) {
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
}: FormGeneratorProps) {
    const saveKey = autoSaveKey || `dynamic-mui:${guid}`;
    const [newPatch, setNewPatch] = useState(patch);
    // Bump to force a re-render when the shared store mutates (dynamic subforms,
    // conditional UI). The counter value itself is never read.
    const [, forceRender] = useReducer((n: number) => n + 1, 0);
    const config = LIBMap.MUI;
    const layout = useMemo(
        () => generateLayout(updatePatchData(data, newPatch, guid, response)),
        [newPatch, data, guid],
    );

    useEffect(() => {
        if (isEmpty(response[guid])) response[guid] = { ...patch };
    }, [guid, patch]);

    useUpdateEffect(() => {
        setNewPatch({ ...patch });
    }, [patch]);

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
                response[guid] = { ...response[guid], ...JSON.parse(saved) };
                setNewPatch((prev) => ({ ...prev, ...JSON.parse(saved) }));
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

        // Trigger re-render to evaluate dynamic subforms and UI rules
        forceRender();
        persistDraft();

        if (typeof onChange === 'function') {
            onChange({ id, value, option });
        }
    }, [guid, onChange, persistDraft]);

    const handleSubmit = useCallback((submitCallback: any, formData: any, formGuid: any) => {
        if (typeof submitCallback === 'function') {
            const errors = getErrors(formData, formGuid);
            submitCallback(response, errors, formData, formGuid);
        }
    }, []);

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

        // 1. Conditional visibility — hidden fields render nothing at all.
        if (field.visibleWhen && !evalRule(field.visibleWhen, liveValues)) {
            return null;
        }

        // 2. Computed / formula field — derive the value, store it (so it submits),
        //    and feed it into the control's props.
        let effectiveProps = cProps;
        if (field.formula && fieldId) {
            const computed = computeFormula(field.formula, liveValues);
            if (response[guid]) response[guid][fieldId] = computed;
            effectiveProps = { ...effectiveProps, value: computed };
        }

        // 3. Enable/disable rule.
        if (field.disabledWhen && evalRule(field.disabledWhen, liveValues)) {
            effectiveProps = {
                ...effectiveProps,
                MuiAttributes: { ...(effectiveProps.MuiAttributes || {}), disabled: true },
            };
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
                        { rule: 'mandatory', message: field.requiredMessage || 'This field is required' },
                    ],
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
                    key={`dynamic-comp-${fieldId || index}`}
                    map={configObj.map}
                    option={options.type || ''}
                    control={field}
                    attributes={effectiveProps}
                    rules={effectiveRules}
                    onChange={onUpdate}
                    onStepUpdate={onStepUpdate}
                    currentStep={activeStep}
                    patch={patch}
                />
                {matchedSubform && matchedSubform.data && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'divider', width: '100%' }}>
                        <FormGenerator
                            guid={`${guid}-subform-${fieldId}`}
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

    return (
        <>
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


