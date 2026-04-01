// @ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Grid, GridProps, Box } from '@mui/material';
import isEmpty from 'lodash/isEmpty';

// eslint-disable-next-line import/no-cycle
import mui from '../config/mui';
import DynamicComponent from './DynamicComponent';
import { generateLayout, generateKey, updatePatchData, FormField } from '../util/helper';
import useUpdateEffect from '../util/useUpdateEffect';
import val from '../util/validation';

const LIBMap = { MUI: { map: mui } };
const response: Record<string, any> = {};

export const FormData = (id?: string) => (id ? response[id] : response);

export const ClearFormData = (id?: string) => {
    const responseKeys = Object.keys(response);
    if (id) {
        delete response[id];
    } else {
        responseKeys.forEach((key) => delete response[key]);
    }
};

const getAllMandatoryFields = (fields: FormField[]) =>
    fields?.filter((field) =>
        field?.rules?.validation?.some((validation: any) => validation.rule === 'mandatory'),
    );

const getErrors = (fields: FormField[], guid: string) => {
    const mandatoryFields = getAllMandatoryFields(fields);
    return mandatoryFields?.reduce((acc: any[], field: FormField) => {
        field?.rules?.validation?.forEach((rule: any) => {
            const fieldId = field?.id || field?.props?.id;
            if (!fieldId) return;

            const fieldValue = response[guid]?.[fieldId]?.toString();
            const isClean = fieldValue && val[rule.rule as keyof typeof val](fieldValue, rule.value);
            if (!isClean) {
                acc.push({ ...rule, id: field.id });
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
}

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
}: FormGeneratorProps) {
    const [newPatch, setNewPatch] = useState(patch);
    const [renderTrigger, setRenderTrigger] = useState(0);
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

    const onUpdate = useCallback(({ id, value, option }: any) => {
        if (!response[guid]) response[guid] = {};
        response[guid][id] = value;

        // Trigger re-render to evaluate dynamic subforms and UI rules
        setRenderTrigger((prev) => prev + 1);

        if (typeof onChange === 'function') {
            onChange({ id, value, option });
        }
    }, [guid, onChange]);

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
        // @ts-ignore
        const configObj = config.map[type] || {};
        const { options = {} } = configObj;

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
            // @ts-ignore
            // @ts-ignore
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
                // onMouseEnter={(e) => {
                //     if (onFieldClick || onFieldDoubleClick) {
                //         e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)'; // faint highlight
                //         e.currentTarget.style.boxShadow = '0 0 0 1px #6366f1'; // focus border
                //     }
                // }}
                // onMouseLeave={(e) => {
                //     if (onFieldClick || onFieldDoubleClick) {
                //         e.currentTarget.style.backgroundColor = 'transparent';
                //         e.currentTarget.style.boxShadow = 'none';
                //     }
                // }}
                onClick={(e) => {
                    // Allow normal clicks for interaction
                    // Only stop propagation if we really need to capture a "selection" click, 
                    // but user said "no change in double click" and implied single click shouldn't select.
                    // So we do nothing special here, letting the input handle the click.
                    if (onFieldClick) {
                        // e.stopPropagation(); // REMOVED to allow Select/Input focus
                        // onFieldClick(field); // REMOVED as we only want double click
                    }
                }}
                onDoubleClick={(e) => {
                    if (onFieldDoubleClick) {
                        e.stopPropagation(); // Capture double click for "Edit"
                        // @ts-ignore
                        onFieldDoubleClick(field);
                    }
                }}
                onContextMenu={(e) => {
                    if (onFieldContextMenu) {
                        e.preventDefault(); // CRITICAL: Stop browser menu
                        e.stopPropagation();
                        // @ts-ignore
                        onFieldContextMenu(e, field);
                    }
                }}
            >
                <DynamicComponent
                    key={`dynamic-comp-${fieldId || index}`}
                    map={configObj.map}
                    option={options.type || ''}
                    control={field}
                    attributes={cProps}
                    rules={rules}
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


