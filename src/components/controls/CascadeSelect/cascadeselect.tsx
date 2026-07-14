import React, { useCallback } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

type Option = { value: any; label: string };

/** Normalize a list that may contain plain strings into `{value,label}`. */
const normalizeOptions = (list: any): Option[] => {
    if (!Array.isArray(list)) return [];
    return list.map((o) =>
        o != null && typeof o === 'object'
            ? { value: o.value, label: o.label ?? o.title ?? String(o.value) }
            : { value: o, label: String(o) },
    );
};

const resolveOptions = (
    optionsMap: Record<string, any> | undefined,
    parentValue: any,
    fallback: any,
): Option[] => {
    const fromMap =
        optionsMap && parentValue != null && parentValue !== ''
            ? optionsMap[parentValue]
            : undefined;
    return normalizeOptions(fromMap ?? fallback ?? []);
};

export default function CascadeSelect({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        parentValue,
        optionsMap,
        options,
        label = '',
        placeholder = '',
        MuiAttributes = {},
    } = attributes;

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const [resolved, setResolved] = React.useState<Option[]>(() =>
        resolveOptions(optionsMap, parentValue, options),
    );
    const [value, setValue] = React.useState<any>(() => attributes?.value ?? '');

    // Sync external value.
    useUpdateEffect(() => {
        setValue(attributes?.value ?? '');
    }, [attributes?.value]);

    // Parent changed: recompute options and clear a now-invalid selection.
    useUpdateEffect(() => {
        const next = resolveOptions(optionsMap, parentValue, options);
        setResolved(next);
        setValue((current: any) => {
            if (current !== '' && current != null && !next.some((o) => o.value === current)) {
                onChange?.({ id, value: '', option: null } as any);
                return '';
            }
            return current;
        });
    }, [parentValue, optionsMap, options]);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const val = event.target.value;
            const option = resolved.find((o) => o.value === val) ?? null;
            setValue(val);
            onChange?.({ id, value: val, option } as any);
        },
        [resolved, id, onChange],
    );

    return (
        <TextField
            select
            fullWidth
            label={label}
            placeholder={placeholder}
            required={isMandatory}
            value={value ?? ''}
            onChange={handleChange}
            SelectProps={{
                displayEmpty: true,
                inputProps: { 'aria-label': label || 'cascade-select' },
            }}
            {...MuiAttributes}
            sx={mergeSx(premiumInputSx as any, MuiAttributes?.sx)}
        >
            {placeholder ? (
                <MenuItem value="">
                    <em>{placeholder}</em>
                </MenuItem>
            ) : null}
            {resolved.map((o) => (
                <MenuItem key={String(o.value)} value={o.value}>
                    {o.label}
                </MenuItem>
            ))}
        </TextField>
    );
}
