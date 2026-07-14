import { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { premiumInputSx, premiumChipSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

/** Split a raw value (array or separator-joined string) into a string[] of tags. */
const hydrate = (raw: any, separator: string): string[] => {
    if (Array.isArray(raw)) return raw.map((t) => String(t)).filter((t) => t !== '');
    if (raw == null || raw === '') return [];
    const str = String(raw);
    // Split on the configured separator and also on ',' when present.
    const parts = str
        .split(new RegExp(`[${separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},]`))
        .map((t) => t.trim())
        .filter((t) => t !== '');
    return parts;
};

/** TagsInput: free-solo, multi-value tag entry backed by MUI Autocomplete. */
export default function TagsInput({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        options = [],
        separator = ';',
        label = '',
        placeholder = '',
    } = attributes;

    const { sx: userSx, ...restMui } = MuiAttributes as any;

    const [tags, setTags] = useState<string[]>(() => hydrate(attributes.value, separator));
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setTags(hydrate(attributes.value, separator));
    }, []);

    useUpdateEffect(() => {
        setTags(hydrate(attributes.value, separator));
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const error = isMandatory && touched && tags.length === 0;
    const helperText = error
        ? rules?.validation?.find((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect')?.message ||
          'Required'
        : '';

    const handleChange = (_event: any, newValue: (string | string[])[]) => {
        const next = (newValue as string[]).map((t) => String(t).trim()).filter((t) => t !== '');
        setTags(next);
        setTouched(true);
        onChange?.({ id, value: next, option: next });
    };

    return (
        <Autocomplete
            freeSolo
            multiple
            id={id}
            options={options as string[]}
            value={tags}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            renderTags={(value: readonly string[], getTagProps) =>
                value.map((tag: string, index: number) => {
                    const tagProps = getTagProps({ index });
                    return <Chip label={tag} {...tagProps} key={tagProps.key} sx={premiumChipSx as any} />;
                })
            }
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    required={isMandatory}
                    error={error}
                    helperText={helperText}
                    sx={mergeSx(premiumInputSx as any, userSx)}
                />
            )}
            {...restMui}
        />
    );
}
