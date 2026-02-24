import { CSSProperties } from 'react';
export interface LayoutConfig {
    row?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    size?: any;
    [key: string]: any;
}
export interface FormField {
    id?: string;
    type?: string;
    layout?: LayoutConfig;
    props?: {
        id?: string;
        value?: any;
        MuiAttributes?: Record<string, any>;
        [key: string]: any;
    };
    visible?: boolean;
    style?: CSSProperties;
    className?: string;
    rules?: any;
    subforms?: {
        conditionValue: any;
        data: FormField[];
    }[];
    [key: string]: any;
}
export interface LayoutResult {
    wrows: FormField[][];
    worows: FormField[];
}
export interface InputPropsConfig {
    MuiInputAdornment?: any;
    position?: 'start' | 'end';
    icon?: string;
    text?: string;
    textstyle?: CSSProperties;
}
export declare function generateLayout(data: FormField[]): LayoutResult;
export declare function getInputProps(InputProps: InputPropsConfig): {
    [x: string]: import("react/jsx-runtime").JSX.Element;
};
export declare const generateKey: (prefix?: string, index?: number) => string;
interface EnableDisableConfig {
    key: string;
    disableIds: string[];
    compareValues?: Record<string, boolean>;
}
export declare const updatePatchData: (fields: FormField[], patch: any, guid: string, response?: Record<string, any>, enableDisableIds?: EnableDisableConfig[]) => FormField[];
export declare const DateComponent: (name: string) => any;
export declare const checkboxSX: (color?: string) => CSSProperties | any;
declare const _default: {
    generateLayout: typeof generateLayout;
    getInputProps: typeof getInputProps;
    generateKey: (prefix?: string, index?: number) => string;
    updatePatchData: (fields: FormField[], patch: any, guid: string, response?: Record<string, any>, enableDisableIds?: EnableDisableConfig[]) => FormField[];
    DateComponent: (name: string) => any;
    checkboxSX: (color?: string) => CSSProperties | any;
};
export default _default;
