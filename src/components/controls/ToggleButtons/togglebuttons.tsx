import { useEffect, useMemo, useState } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Icon from '@mui/material/Icon';
import { mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

interface Option {
    value: any;
    label: string;
    icon?: string;
}

/** Normalize string[] or {value,label,icon}[] into a consistent Option[]. */
const normalize = (options: any[]): Option[] =>
    (options || []).map((o) =>
        typeof o === 'object' && o !== null
            ? { value: o.value, label: o.label ?? String(o.value), icon: o.icon }
            : { value: o, label: String(o) },
    );

const premiumGroupSx = {
    '& .MuiToggleButton-root': {
        borderRadius: '10px !important',
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all .18s',
        border: '1px solid',
        px: 2,
    },
    gap: 1,
};

/** ToggleButtons: single- or multi-select toggle group backed by MUI. */
export default function ToggleButtons({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        multiple = false,
        label = '',
        size = 'medium',
        color = 'primary',
    } = attributes;

    const { sx: userSx, ...restMui } = MuiAttributes as any;

    const options = useMemo(() => normalize(attributes.options || []), [attributes.options]);

    const initValue = () => {
        if (multiple) return Array.isArray(attributes.value) ? attributes.value : [];
        return attributes.value ?? null;
    };

    const [value, setValue] = useState<any>(initValue);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        setValue(initValue());
    }, []);

    useUpdateEffect(() => {
        setValue(initValue());
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const isEmpty = multiple ? !Array.isArray(value) || value.length === 0 : value == null || value === '';
    const error = isMandatory && touched && isEmpty;
    const helperText = error
        ? rules?.validation?.find((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect')?.message ||
          'Required'
        : '';

    const handleChange = (_event: any, newValue: any) => {
        setValue(newValue);
        setTouched(true);
        const option = multiple
            ? options.filter((o) => (newValue || []).includes(o.value))
            : options.find((o) => o.value === newValue) ?? null;
        onChange?.({ id, value: newValue, option });
    };

    return (
        <FormControl required={isMandatory} error={error} component="fieldset">
            {label && (
                <FormLabel required={isMandatory} error={error} sx={{ mb: 0.75, fontWeight: 600 }}>
                    {label}
                </FormLabel>
            )}
            <ToggleButtonGroup
                value={value}
                exclusive={!multiple}
                onChange={handleChange}
                size={size}
                color={color}
                sx={mergeSx(premiumGroupSx as any, userSx)}
                {...restMui}
            >
                {options.map((o) => (
                    <ToggleButton key={String(o.value)} value={o.value}>
                        {o.icon && (
                            <Icon fontSize="small" sx={{ mr: o.label ? 0.75 : 0 }}>
                                {o.icon}
                            </Icon>
                        )}
                        {o.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
