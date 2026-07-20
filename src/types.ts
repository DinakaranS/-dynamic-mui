import type { CSSProperties } from 'react';

/** A single validation rule attached to a field. `rule` maps to a key in the
 *  validation utility (e.g. 'mandatory', 'email', 'length'). */
export interface ValidationRule {
    rule: string;
    message?: string;
    /** Optional argument forwarded to the validator (e.g. length options). */
    value?: any;
    [key: string]: any;
}

export interface FieldRules {
    validation?: ValidationRule[];
    [key: string]: any;
}

/** Conditionally-rendered sub-form shown when the parent field equals
 *  `conditionValue` (or, for multi-value fields, includes it). */
export interface SubForm {
    conditionValue: any;
    data: FormField[];
}

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

export interface FieldProps {
    id?: string;
    value?: any;
    // Kept as `any` deliberately: these are spread straight onto MUI components
    // (e.g. `<DataGrid {...MuiAttributes} />`), and a stricter type would break
    // those spreads by not satisfying each component's required props.
    MuiAttributes?: any;
    InputProps?: any;
    options?: any[];
    format?: string;
    [key: string]: any;
}

/**
 * A condition (or nested AND/OR/NOR group) evaluated against the form's live
 * values to drive reactive behaviour. See `util/rules` for the full shape.
 */
export type RuleExpression =
    | { field: string; op?: string; value?: any }
    | { all?: RuleExpression[]; any?: RuleExpression[]; none?: RuleExpression[] };

/** The JSON schema entry describing one field/control in a form. */
export interface FormField {
    id?: string;
    type?: string;
    layout?: LayoutConfig;
    props?: FieldProps;
    visible?: boolean;
    style?: CSSProperties;
    className?: string;
    rules?: FieldRules;
    subforms?: SubForm[];
    /** Show this field only when the condition holds (else it renders nothing). */
    visibleWhen?: RuleExpression;
    /** Disable this field's control when the condition holds. */
    disabledWhen?: RuleExpression;
    /** Make this field mandatory only when the condition holds. */
    requiredWhen?: RuleExpression;
    /** Error message used by `requiredWhen`. */
    requiredMessage?: string;
    /** Arithmetic formula (e.g. "qty * price") computed from other field values. */
    formula?: string;
    /**
     * Dynamic options: the id of another field whose value selects this field's
     * options from `optionsMap`. Keeps ONE control whose options change (e.g. a
     * single State select driven by Country) instead of duplicating fields.
     */
    dependsOn?: string;
    /** Map of `dependsOn` value → options for this field. */
    optionsMap?: Record<string, any[]>;
    [key: string]: any;
}

/** An unmet validation rule reported back through `onSubmit`. */
export interface FormError extends ValidationRule {
    id?: string;
}

export interface ControlChangeProps {
    id?: string;
    value: any;
    option?: any;
}

export interface ControlProps {
    attributes?: FieldProps;
    rules?: FieldRules;
    patch?: Record<string, any>;
    onChange?: (args: ControlChangeProps) => void;
    /** Incremented by FormGenerator on each submit attempt — controls re-run their
     *  validation and display the error (so untouched invalid fields turn red). */
    submitTick?: number;
    /** Localizable built-in messages (e.g. `{ required: '…' }`). */
    messages?: { required?: string; [key: string]: any };
}
