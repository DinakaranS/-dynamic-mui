import type { FormField, RuleExpression } from './types';

/**
 * TYPED SCHEMA LAYER (additive, authoring-only)
 * ---------------------------------------------
 * A convenience, compile-time layer on top of the loose runtime `FormField`.
 * Authors get autocomplete + type-checking for the common controls, while
 * `defineForm` erases the extra typing and hands FormGenerator the exact
 * `FormField[]` it already expects. Nothing here changes runtime behaviour.
 */

/** An option entry accepted by option-based controls. */
export interface TypedOption {
    value: any;
    label: string;
    [k: string]: any;
}

/** Options that may be given as bare strings or {value,label} objects. */
export type LooseOption = string | TypedOption;

/** Per-field grid/layout hints (subset of runtime `LayoutConfig`). */
export interface TypedLayout {
    row?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    [k: string]: any;
}

/** Typed validation rule for the `rules.validation` array. */
export interface TypedValidationRule {
    rule: string;
    message?: string;
    value?: any;
    [k: string]: any;
}

export interface TypedRules {
    validation?: TypedValidationRule[];
    [k: string]: any;
}

/** MUI attribute bag — kept open so any MUI prop still type-checks. */
export interface TypedMuiAttributes {
    label?: string;
    placeholder?: string;
    helperText?: string;
    variant?: string;
    fullWidth?: boolean;
    [k: string]: any;
}

/** Fields shared by every typed variant. */
export interface TypedFieldBase {
    id: string;
    layout?: TypedLayout;
    rules?: TypedRules;
    visible?: boolean;
    visibleWhen?: RuleExpression | any;
    disabledWhen?: RuleExpression | any;
    requiredWhen?: RuleExpression | any;
    requiredMessage?: string;
}

/* -------------------------------------------------------------------------- */
/* Per-control typed variants                                                 */
/* -------------------------------------------------------------------------- */

export interface TextFieldField extends TypedFieldBase {
    type: 'textfield';
    props: {
        id: string;
        value?: string;
        multiline?: boolean;
        rows?: number;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface NumberFieldField extends TypedFieldBase {
    type: 'numberfield';
    props: {
        id: string;
        value?: number;
        min?: number;
        max?: number;
        step?: number;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface PasswordField extends TypedFieldBase {
    type: 'password';
    props: {
        id: string;
        value?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface CurrencyField extends TypedFieldBase {
    type: 'currency';
    props: {
        id: string;
        value?: number;
        currency?: string;
        locale?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface PhoneField extends TypedFieldBase {
    type: 'phone';
    props: {
        id: string;
        value?: string;
        defaultCountry?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface OtpField extends TypedFieldBase {
    type: 'otp';
    props: {
        id: string;
        value?: string;
        length?: number;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface SelectField extends TypedFieldBase {
    type: 'select';
    props: {
        id: string;
        value?: any;
        options: TypedOption[];
        multiple?: boolean;
        MuiAttributes?: TypedMuiAttributes;
        MuiBoxAttributes?: any;
        [k: string]: any;
    };
}

export interface AutoCompleteField extends TypedFieldBase {
    type: 'autocomplete';
    props: {
        id: string;
        value?: any;
        options: LooseOption[];
        multiple?: boolean;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface RadioField extends TypedFieldBase {
    type: 'radio';
    props: {
        id: string;
        value?: any;
        options: LooseOption[];
        row?: boolean;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface CheckBoxField extends TypedFieldBase {
    type: 'checkbox';
    props: {
        id: string;
        value?: boolean;
        label?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface SwitchField extends TypedFieldBase {
    type: 'switch';
    props: {
        id: string;
        value?: boolean;
        label?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface ConsentField extends TypedFieldBase {
    type: 'consent';
    props: {
        id: string;
        value?: boolean;
        label?: string;
        text?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface ChipSelectOrToggleField extends TypedFieldBase {
    type: 'chipselect' | 'togglebuttons';
    props: {
        id: string;
        value?: any;
        label?: string;
        options: LooseOption[];
        multiple?: boolean;
        [k: string]: any;
    };
}

export interface TagsInputField extends TypedFieldBase {
    type: 'tagsinput';
    props: {
        id: string;
        value?: string[];
        label?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface RatingField extends TypedFieldBase {
    type: 'rating';
    props: {
        id: string;
        value?: number;
        max?: number;
        precision?: number;
        label?: string;
        [k: string]: any;
    };
}

export interface SliderField extends TypedFieldBase {
    type: 'slider';
    props: {
        id: string;
        value?: number | number[];
        min?: number;
        max?: number;
        step?: number;
        marks?: boolean | { value: number; label?: string }[];
        label?: string;
        [k: string]: any;
    };
}

export interface ColorPickerField extends TypedFieldBase {
    type: 'colorpicker';
    props: {
        id: string;
        value?: string;
        label?: string;
        [k: string]: any;
    };
}

export interface DateTimeField extends TypedFieldBase {
    type: 'datetime' | 'datetimepicker' | 'timepicker' | 'daterangepicker';
    props: {
        id: string;
        value?: any;
        format?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface FileUploadField extends TypedFieldBase {
    type: 'fileupload';
    props: {
        id: string;
        value?: any;
        accept?: string;
        multiple?: boolean;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface SignatureField extends TypedFieldBase {
    type: 'signature';
    props: {
        id: string;
        value?: any;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface MarkdownField extends TypedFieldBase {
    type: 'markdown';
    props: {
        id: string;
        value?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface KeyValueField extends TypedFieldBase {
    type: 'keyvalue';
    props: {
        id: string;
        value?: Record<string, any> | { key: string; value: any }[];
        label?: string;
        [k: string]: any;
    };
}

export interface MatrixField extends TypedFieldBase {
    type: 'matrix';
    props: {
        id: string;
        value?: any;
        rows?: LooseOption[];
        columns?: LooseOption[];
        [k: string]: any;
    };
}

export interface AddressField extends TypedFieldBase {
    type: 'address';
    props: {
        id: string;
        value?: any;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface GeoField extends TypedFieldBase {
    type: 'geo';
    props: {
        id: string;
        value?: any;
        [k: string]: any;
    };
}

export interface CascadeSelectField extends TypedFieldBase {
    type: 'cascadeselect';
    props: {
        id: string;
        value?: any;
        options: any[];
        [k: string]: any;
    };
}

export interface ComputedField extends TypedFieldBase {
    type: 'computed';
    props: {
        id: string;
        formula: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
    formula?: string;
}

export interface AlertField extends TypedFieldBase {
    type: 'alert';
    props: {
        id: string;
        severity?: 'error' | 'warning' | 'info' | 'success';
        message?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface TypographyField extends TypedFieldBase {
    type: 'typography';
    props: {
        id: string;
        value?: string;
        variant?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface ButtonField extends TypedFieldBase {
    type: 'button';
    props: {
        id: string;
        label?: string;
        action?: string;
        MuiAttributes?: TypedMuiAttributes;
        [k: string]: any;
    };
}

export interface DividerField extends TypedFieldBase {
    type: 'divider';
    props?: {
        id?: string;
        [k: string]: any;
    };
}

/**
 * Catch-all — any control key still type-checks (e.g. the less-common ones in
 * `config/mui.ts`). Kept permissive on purpose so authors are never blocked.
 * Listed LAST so the specific variants win discrimination when they match.
 */
export interface GenericField {
    type: string;
    id?: string;
    props?: Record<string, any>;
    layout?: TypedLayout;
    rules?: TypedRules;
    visibleWhen?: RuleExpression | any;
    disabledWhen?: RuleExpression | any;
    requiredWhen?: RuleExpression | any;
    [k: string]: any;
}

/** Discriminated union across the common controls (+ a permissive fallback). */
export type TypedField =
    | TextFieldField
    | NumberFieldField
    | PasswordField
    | CurrencyField
    | PhoneField
    | OtpField
    | SelectField
    | AutoCompleteField
    | RadioField
    | CheckBoxField
    | SwitchField
    | ConsentField
    | ChipSelectOrToggleField
    | TagsInputField
    | RatingField
    | SliderField
    | ColorPickerField
    | DateTimeField
    | FileUploadField
    | SignatureField
    | MarkdownField
    | KeyValueField
    | MatrixField
    | AddressField
    | GeoField
    | CascadeSelectField
    | ComputedField
    | AlertField
    | TypographyField
    | ButtonField
    | DividerField
    | GenericField;

/** A complete typed form. */
export type TypedSchema = TypedField[];

/**
 * Typed authoring entry point. Accepts a `TypedSchema` (autocompleted +
 * type-checked) and returns the runtime `FormField[]` that FormGenerator
 * consumes. Purely a compile-time convenience — no runtime transformation.
 */
export function defineForm(schema: TypedSchema): FormField[] {
    return schema as unknown as FormField[];
}

export type { FormField, RuleExpression } from './types';
