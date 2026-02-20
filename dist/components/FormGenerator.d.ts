import { default as React } from 'react';
import { GridProps } from '@mui/material';
import { FormField } from '../util/helper';
export declare const FormData: (id?: string) => any;
export declare const ClearFormData: (id?: string) => void;
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
    onChange?: (args: {
        id: string;
        value: any;
        option?: any;
    }) => void;
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
export declare function FormGenerator({ data, patch, guid, formRef, onSubmit, onChange, onStepChange, MuiGridAttributes, activeStep, onFieldClick, onFieldDoubleClick, onFieldContextMenu, }: FormGeneratorProps): import("react/jsx-runtime").JSX.Element;
