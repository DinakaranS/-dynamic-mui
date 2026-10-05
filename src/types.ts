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

/**
 * Text shown on a `collection` item card: a field id (`'customerName'`), a
 * template (`'{city}, {state} {zip}'`), a list of ids joined with " · ", or a
 * function of the item.
 */
export type CollectionTextSpec = string | string[] | ((item: Record<string, any>) => string);

/** A theme palette name, or any CSS colour (`'#0ea5e9'`). */
export type CollectionColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | (string & {});

/** One labelled fact on an item card: icon in front, then label and value. */
export interface CollectionDetailSpec {
    /** Field id whose value is shown. */
    field: string;
    /** Label override (defaults to the field's own label). */
    label?: string;
    /** Material icon name shown in front (defaults to one based on the field type). */
    icon?: string;
    /** Grid columns this detail spans (grid layout). */
    span?: number;
}

/** Responsive column count, e.g. `{ xs: 1, sm: 2, md: 4 }`. */
export type CollectionColumns = number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

/** How a `collection` item is summarised on its card / row. */
export interface CollectionDisplay {
    /** Card heading / first table column. Defaults to the first field. */
    title?: CollectionTextSpec;
    /** Heading of the title column in the table layout (defaults to `itemLabel`). */
    titleLabel?: string;
    /** Optional secondary line under the title. */
    subtitle?: CollectionTextSpec;
    /** Material icon in front of the subtitle (e.g. `'place'` for an address). */
    subtitleIcon?: string;
    /** A status pill. `colors` maps a raw value (or its label) to a colour;
     *  `label` heads its column in the table layout. */
    badge?: string | { field: string; label?: string; colors?: Record<string, CollectionColor | 'default'> };
    /** Leading avatar on cards: initials of the title, the collection icon, the item number, or none (default). */
    avatar?: 'initials' | 'icon' | 'index' | 'none';
    /**
     * The labelled facts under the title. Defaults to every filled field not
     * already in the title/subtitle/badge. List ids or `{ field, label, icon, span }`
     * to choose and order them, or `false` to hide them.
     */
    details?: (string | CollectionDetailSpec)[] | false;
    /** `grid` (icon tiles), `list` (one row per fact) or `inline` (a wrapping line). */
    detailsLayout?: 'grid' | 'list' | 'inline';
    /** Grid columns. Defaults to as many as fit `minColumnWidth`. */
    columns?: CollectionColumns;
    /** Narrowest grid column in px when `columns` is not set (default 180). */
    minColumnWidth?: number;
    /** Show the icon in front of each detail (default true). */
    showIcons?: boolean;
}

/** The add button of a collection level. */
export interface CollectionAddButton {
    /** `header` (beside the title, default), `footer` (below the list), `both`, or `none`. */
    position?: 'header' | 'footer' | 'both' | 'none';
    /** `contained` (top-level default), `outlined` (nested default), `text`, `soft` (tinted) or `dashed` (full-width tile). */
    variant?: 'dashed' | 'soft' | 'contained' | 'outlined' | 'text';
    /** Material icon name (default `'add'`). */
    icon?: string;
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
}

/** Which item actions are offered. Edit and delete are on by default;
 *  duplicate, move (up/down) and collapse are opt-in. */
export interface CollectionActions {
    edit?: boolean;
    delete?: boolean;
    duplicate?: boolean;
    move?: boolean;
    /** Collapse/expand toggle on items that own nested collections. */
    collapse?: boolean;
}

/**
 * Every user-facing string, so labels can be reworded or translated from JSON.
 * Placeholders: `{label}` item label, `{labelLower}`, `{plural}`, `{pluralLower}`,
 * `{title}` item title, `{max}`, `{detail}`. Nested levels inherit their parent's texts.
 */
export interface CollectionTexts {
    add?: string;
    addMore?: string;
    emptyTitle?: string;
    emptyText?: string;
    edit?: string;
    duplicate?: string;
    moveUp?: string;
    moveDown?: string;
    delete?: string;
    more?: string;
    collapse?: string;
    expand?: string;
    editAria?: string;
    deleteAria?: string;
    viewAria?: string;
    moreAria?: string;
    collapseAria?: string;
    expandAria?: string;
    maxReached?: string;
    dialogAddTitle?: string;
    dialogEditTitle?: string;
    dialogViewTitle?: string;
    /** Line under a nested dialog title naming the parent, e.g. "For {parent}". */
    dialogContext?: string;
    save?: string;
    saveChanges?: string;
    saveAndAddAnother?: string;
    cancel?: string;
    close?: string;
    closeAria?: string;
    shortcut?: string;
    deleteTitle?: string;
    deleteMessage?: string;
    deleteDetail?: string;
    deleteConfirm?: string;
}

/**
 * Named parts of a collection level that take an MUI `sx` override from JSON.
 * The override is merged over the built-in style, so any look can be changed.
 */
export type CollectionSlot =
    // level
    | 'root' | 'header' | 'headerIcon' | 'headerTitle' | 'headerCount' | 'headerDescription'
    | 'error' | 'list' | 'addButton' | 'empty' | 'emptyTitle' | 'emptyText'
    // item
    | 'item' | 'itemHeader' | 'avatar' | 'itemTitle' | 'badge' | 'subtitle' | 'actions' | 'actionButton'
    | 'counts' | 'details' | 'detail' | 'detailIcon' | 'detailLabel' | 'detailValue' | 'sections' | 'section'
    // table layout
    | 'table' | 'tableHead' | 'tableHeadCell' | 'tableRow' | 'tableCell' | 'rowActions' | 'mobileRow'
    // dialog
    | 'dialog' | 'dialogHeader' | 'dialogTitle' | 'dialogDescription' | 'dialogContext'
    | 'dialogContent' | 'dialogActions' | 'dialogCancel' | 'dialogSaveAnother' | 'dialogSave'
    // menu + delete confirmation
    | 'menu' | 'menuItem' | 'confirm' | 'confirmTitle' | 'confirmText' | 'confirmCancel' | 'confirmDelete';

export type CollectionStyles = Partial<Record<CollectionSlot, Record<string, any>>>;

/**
 * One level of a `collection` field: a list of items added/edited through a
 * dialog, rendered as cards. Each item can own nested `collections` (e.g. a
 * Customer Location with Services and Backflow devices), to any depth.
 * Everything — content, layout, wording and styling — is set from JSON.
 * Output: `[{ ...itemFields, [child.id]: [{ ...childFields }] }]`.
 */
export interface CollectionConfig {
    /** Key of this list in its parent item (the field id at the root). */
    id: string;
    /** Singular name, e.g. "Customer Location" → "Add Customer Location". */
    itemLabel?: string;
    /** Section heading. Defaults to the plural of `itemLabel`. */
    title?: string;
    /** Helper text under the heading. */
    description?: string;
    /** Material icon name for the section, dialog and item avatars. */
    icon?: string;
    /** Accent colour for this level (palette name or any CSS colour). */
    color?: CollectionColor;
    /** The fields of the add/edit dialog (any FormGenerator schema). */
    fields: FormField[];
    /** Card summary configuration. */
    display?: CollectionDisplay;
    /** Nested lists owned by each item. */
    collections?: CollectionConfig[];
    /** Columns for this level's nested sections inside an item (default 1 = stacked rows). */
    sectionColumns?: CollectionColumns;
    /** How items are shown: `cards` (top-level default) or `table` (nested
     *  default — one row per item, one column per detail; stacked rows on phones). */
    layout?: 'cards' | 'table';
    /** Card look: `outlined` (default, thin border), `card` (soft shadow) or `flat`. */
    variant?: 'card' | 'outlined' | 'flat';
    /** Add button placement and look. */
    addButton?: CollectionAddButton;
    /** Which item actions are offered. */
    actions?: CollectionActions;
    /** Minimum / maximum number of items at this level (validated on submit). */
    min?: number;
    max?: number;
    minMessage?: string;
    maxMessage?: string;
    /** Dialog options. `addAnother` shows "Save & add another" (default true);
     *  `fullScreen` is `'mobile'` (default), `true` or `false`. */
    dialog?: {
        maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        description?: string;
        addAnother?: boolean;
        fullScreen?: boolean | 'mobile';
        /** Grid spacing of the dialog form. */
        spacing?: number;
    };
    /** Ask before deleting an item (default true). */
    confirmDelete?: boolean;
    /** Start items collapsed (default false). */
    defaultCollapsed?: boolean;
    /** Show a message when the list is empty. Defaults: true at the top level,
     *  false when nested (an empty nested section is just its title + add button). */
    showEmpty?: boolean;
    /** Reword / translate any text (inherited by nested levels). */
    texts?: CollectionTexts;
    /** Per-part `sx` overrides — see `CollectionSlot`. */
    styles?: CollectionStyles;
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
