import { remove, clone, map, uniq, sortBy, each, cloneDeep } from 'lodash';
import isEmpty from 'lodash/isEmpty';
import { Icon, InputAdornment } from '@mui/material';
import {
    DatePicker,
    MobileDatePicker,
    DesktopDatePicker,
    // DateRangePicker,
    // MobileDateRangePicker,
    // DesktopDateRangePicker,
    MobileDateTimePicker,
    DesktopDateTimePicker,
    DateTimePicker,
    TimePicker,
    DesktopTimePicker,
    MobileTimePicker,
} from '@mui/x-date-pickers';
import { CSSProperties } from 'react';

// --- Types ---
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

// --- Helper Functions ---

export function generateLayout(data: FormField[]): LayoutResult {
    const layout: LayoutResult = { wrows: [], worows: [] };
    const wrows = clone(data);

    // Items without a row -> worows
    const removed = remove(wrows, (item: any) => {
        const isLayout = item.layout ? item.layout.row : item.layout;
        return isLayout === undefined;
    });

    // Create a new item with MUI v7-friendly layout.size (no param reassign)
    const normalizeItem = (it: FormField): FormField => {
        const l = it.layout ?? {};
        const computedSize = (() => {
            if (l.size && typeof l.size === 'object') return l.size;
            const s: any = {};
            if (l.xs != null) s.xs = l.xs;
            if (l.sm != null) s.sm = l.sm;
            if (l.md != null) s.md = l.md;
            if (l.lg != null) s.lg = l.lg;
            if (l.xl != null) s.xl = l.xl;
            return Object.keys(s).length ? s : { xs: 12 };
        })();

        // strip legacy breakpoint keys; keep everything else on layout
        const { xs, sm, md, lg, xl, size, ...restLayout } = l;
        const normalizedLayout = { ...restLayout, size: size ?? computedSize };

        return { ...it, layout: normalizedLayout };
    };

    layout.worows = removed.map(normalizeItem);

    // Group remaining items by row
    const rowIndex = map(wrows, 'layout.row');
    const uniqIndex = uniq(rowIndex);
    const sortedIndex = sortBy(uniqIndex);

    each(sortedIndex, (value: any) => {
        const rows: FormField[] = [];
        each(wrows, (it: any) => {
            if (it.layout && it.layout.row === value) {
                rows.push(normalizeItem(it));
            }
        });
        layout.wrows.push(rows);
    });

    return layout;
}

export function getInputProps(InputProps: InputPropsConfig) {
    if (!isEmpty(InputProps)) {
        const { MuiInputAdornment = {}, position = 'start', icon, text, textstyle = {} } = InputProps;
        return {
            [`${position}Adornment`]: (
                <InputAdornment {...MuiInputAdornment} key={`custom-icon-Adornment-${position}`}>
                    {icon && <Icon>{icon}</Icon>}
                    {!isEmpty(textstyle) ? <div style={textstyle}>{text || ''}</div> : text || ''}
                </InputAdornment>
            ),
        };
    }
    return {};
}

export const generateKey = (prefix = '', index = 0): string => {
    const random = Math.random().toString(36).substr(2, 9);
    const currentTime = new Date().toLocaleTimeString('en').trim();

    return `${prefix}_${index}_${random}_${currentTime}`;
};

function isEmptyCustom(value: any): boolean {
    return (
        // null or undefined
        value == null ||
        // has length and it's zero
        // eslint-disable-next-line no-prototype-builtins
        (value.hasOwnProperty('length') && value.length === 0) ||
        // is an Object and has no keys
        (value.constructor === Object && Object.keys(value).length === 0)
    );
}

interface EnableDisableConfig {
    key: string;
    disableIds: string[];
    compareValues?: Record<string, boolean>;
}

export const updatePatchData = (
    fields: FormField[],
    patch: any,
    guid: string,
    response: Record<string, any> = {},
    enableDisableIds: EnableDisableConfig[] = [],
): FormField[] => {
    try {
        // Update response with the patch for the provided GUID

        response[guid] = patch;

        // Map and update fields with response data
        const updatedFields = map(fields, (field: any) => {
            const newField = cloneDeep(field);
            const id = newField?.id || newField?.props?.id;

            if (id && response[guid] && !isEmptyCustom(response[guid][id])) {
                const defaultValue = ['switch', 'checkbox'].includes(newField?.type || '') ? false : '';
                newField.props = {
                    ...newField.props,
                    value: response[guid][id] === undefined ? defaultValue : response[guid][id],
                };
            }
            return newField;
        });

        // Handle enable/disable logic
        if (enableDisableIds.length > 0) {
            enableDisableIds.forEach(({ key, disableIds, compareValues = {} }) => {
                const controllingField = updatedFields.find(
                    (field: any) => field?.id === key || field?.props?.id === key,
                );

                if (controllingField) {
                    const val = controllingField?.props?.value;
                    const disabled = compareValues[val];

                    disableIds.forEach((patchId) => {
                        const targetFieldIndex = updatedFields.findIndex(
                            (field: any) => field?.id === patchId || field?.props?.id === patchId,
                        );

                        if (targetFieldIndex !== -1) {
                            const tElement = updatedFields[targetFieldIndex];
                            const id = tElement?.id || tElement?.props?.id;
                            if (id) {

                                response[guid][id] = disabled ? '' : response[guid][id];
                            }

                            updatedFields[targetFieldIndex] = {
                                ...updatedFields[targetFieldIndex],
                                props: {
                                    ...updatedFields[targetFieldIndex].props,
                                    value: disabled ? '' : updatedFields[targetFieldIndex]?.props?.value,
                                    MuiAttributes: {
                                        ...updatedFields[targetFieldIndex].props?.MuiAttributes,
                                        disabled,
                                    },
                                },
                            };
                        }
                    });
                }
            });
        }

        return updatedFields;
    } catch (error) {

        console.error('Error updating patch data:', error);
        return fields; // Return original fields on error
    }
};

export const DateComponent = (name: string): any => {
    if (name === 'MobileDatePicker') return MobileDatePicker;
    if (name === 'DesktopDatePicker') return DesktopDatePicker;
    // if (name === 'DateRangePicker') return DateRangePicker;
    // if (name === 'MobileDateRangePicker') return MobileDateRangePicker;
    // if (name === 'DesktopDateRangePicker') return DesktopDateRangePicker;
    if (name === 'DateTimePicker') return DateTimePicker;
    if (name === 'MobileDateTimePicker') return MobileDateTimePicker;
    if (name === 'DesktopDateTimePicker') return DesktopDateTimePicker;
    if (name === 'TimePicker') return TimePicker;
    if (name === 'MobileTimePicker') return MobileTimePicker;
    if (name === 'DesktopTimePicker') return DesktopTimePicker;
    return DatePicker;
};

// ─────────────────────────────────────────────────────────────────────────────
// Legacy MUI prop migration (pre-v9 → v9+)
// ─────────────────────────────────────────────────────────────────────────────
// Forms authored against MUI v5-v8 use prop names that were renamed/moved in
// v9 (InputProps → slotProps.input, primaryTypographyProps → slotProps.primary,
// Typography fontWeight/paragraph → sx). This migrator is a no-op on already-
// current JSON, so it's safe to run unconditionally on incoming form data.

const TYPOGRAPHY_DIRECT_TO_SX_KEYS = ['fontWeight', 'fontSize', 'fontStyle', 'fontFamily'];

const migrateMuiAttributes = (attrs: any): any => {
    if (!attrs || typeof attrs !== 'object') return attrs;
    const out: any = { ...attrs };

    // TextField-style: InputProps / inputProps → slotProps.{input, htmlInput}
    if (out.InputProps || out.inputProps) {
        const existingSlot = out.slotProps || {};
        const nextSlot: any = { ...existingSlot };
        if (out.InputProps) {
            nextSlot.input = { ...(existingSlot.input || {}), ...out.InputProps };
            delete out.InputProps;
        }
        if (out.inputProps) {
            nextSlot.htmlInput = { ...(existingSlot.htmlInput || {}), ...out.inputProps };
            delete out.inputProps;
        }
        out.slotProps = nextSlot;
    }

    // ListItemText: primaryTypographyProps / secondaryTypographyProps → slotProps.{primary, secondary}
    if (out.primaryTypographyProps || out.secondaryTypographyProps) {
        const existingSlot = out.slotProps || {};
        const nextSlot: any = { ...existingSlot };
        if (out.primaryTypographyProps) {
            // Typography props were flattened; move fontWeight/etc into sx inside the slot
            const p = out.primaryTypographyProps;
            const sx: any = { ...(p.sx || {}) };
            const rest: any = {};
            Object.keys(p).forEach((k) => {
                if (TYPOGRAPHY_DIRECT_TO_SX_KEYS.includes(k)) sx[k] = p[k];
                else if (k !== 'sx') rest[k] = p[k];
            });
            nextSlot.primary = { ...(existingSlot.primary || {}), ...rest, sx };
            delete out.primaryTypographyProps;
        }
        if (out.secondaryTypographyProps) {
            const p = out.secondaryTypographyProps;
            const sx: any = { ...(p.sx || {}) };
            const rest: any = {};
            Object.keys(p).forEach((k) => {
                if (TYPOGRAPHY_DIRECT_TO_SX_KEYS.includes(k)) sx[k] = p[k];
                else if (k !== 'sx') rest[k] = p[k];
            });
            nextSlot.secondary = { ...(existingSlot.secondary || {}), ...rest, sx };
            delete out.secondaryTypographyProps;
        }
        out.slotProps = nextSlot;
    }

    // Typography direct props → sx; `paragraph` → sx.mb fallback
    if (TYPOGRAPHY_DIRECT_TO_SX_KEYS.some((k) => k in out) || 'paragraph' in out) {
        const sx: any = { ...(out.sx || {}) };
        TYPOGRAPHY_DIRECT_TO_SX_KEYS.forEach((k) => {
            if (k in out) {
                sx[k] = out[k];
                delete out[k];
            }
        });
        if ('paragraph' in out) {
            if (out.paragraph) sx.mb = sx.mb ?? 2;
            delete out.paragraph;
        }
        out.sx = sx;
    }

    return out;
};

export const migrateFormField = (field: any): any => {
    if (!field || typeof field !== 'object') return field;
    const migrated: any = { ...field };
    const props = migrated.props || {};
    migrated.props = {
        ...props,
        ...(props.MuiAttributes ? { MuiAttributes: migrateMuiAttributes(props.MuiAttributes) } : {}),
    };
    // Recurse into stepper steps
    if (migrated.type === 'stepper' && Array.isArray(migrated.props?.MuiSteps)) {
        migrated.props.MuiSteps = migrated.props.MuiSteps.map((step: any) => ({
            ...step,
            components: Array.isArray(step.components) ? step.components.map(migrateFormField) : step.components,
        }));
    }
    // Recurse into subforms
    if (Array.isArray(migrated.subforms)) {
        migrated.subforms = migrated.subforms.map((sub: any) => ({
            ...sub,
            data: Array.isArray(sub.data) ? sub.data.map(migrateFormField) : sub.data,
        }));
    }
    // Recurse into nested fields (Group, Accordion, Tabs, FormRepeater, etc.)
    if (Array.isArray(migrated.props?.subFields)) {
        migrated.props.subFields = migrated.props.subFields.map(migrateFormField);
    }
    return migrated;
};

export const migrateFormData = (data: any[]): any[] => {
    if (!Array.isArray(data)) return data;
    return data.map(migrateFormField);
};

export const checkboxSX = (color?: string): CSSProperties | any => {
    if (color)
        return {
            color,
            '&.Mui-checked': {
                color,
            },
        };
    return {};
};

export default {
    generateLayout,
    getInputProps,
    generateKey,
    updatePatchData,
    DateComponent,
    checkboxSX,
    migrateFormData,
    migrateFormField,
};
