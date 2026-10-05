import React from 'react';
import { NumericFormat } from 'react-number-format';
import TextField from '@mui/material/TextField';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

export default function CurrencyField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        prefix = '$',
        thousandSeparator = ',',
        decimalScale = 2,
        fixedDecimalScale = true,
        label,
        MuiAttributes = {},
    } = attributes;
    const { sx: userSx, ...restMuiAttributes } = MuiAttributes;

    const [value, setValue] = React.useState(attributes.value ?? '');

    useUpdateEffect(() => {
        setValue(attributes.value ?? '');
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    return (
        <NumericFormat
            customInput={TextField}
            prefix={prefix}
            thousandSeparator={thousandSeparator}
            decimalScale={decimalScale}
            fixedDecimalScale={fixedDecimalScale}
            valueIsNumericString
            value={value}
            onValueChange={(v) => {
                setValue(v.value);
                onChange?.({ id, value: v.value, option: v.floatValue });
            }}
            fullWidth
            required={isMandatory}
            label={label}
            id={id}
            name="currencyformat"
            {...restMuiAttributes}
            sx={mergeSx(premiumInputSx as any, userSx)}
        />
    );
}
