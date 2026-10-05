import React from 'react';
import { PatternFormat } from 'react-number-format';
import TextField from '@mui/material/TextField';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

export default function PhoneField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        format = '+1 (###) ###-####',
        mask = '_',
        label,
        MuiAttributes = {},
    } = attributes;
    const { sx: userSx, ...restMuiAttributes } = MuiAttributes;

    const [value, setValue] = React.useState(attributes.value || '');

    useUpdateEffect(() => {
        setValue(attributes.value || '');
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    return (
        <PatternFormat
            customInput={TextField}
            format={format}
            mask={mask}
            value={value}
            onValueChange={(v) => {
                setValue(v.value);
                onChange?.({ id, value: v.value, option: v.formattedValue });
            }}
            fullWidth
            required={isMandatory}
            label={label}
            id={id}
            name="phoneformat"
            {...restMuiAttributes}
            sx={mergeSx(premiumInputSx as any, userSx)}
        />
    );
}
