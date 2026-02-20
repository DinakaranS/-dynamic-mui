/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent, FocusEvent, WheelEvent } from 'react';
import numeral from 'numeral';
import MuiTextField from '@mui/material/TextField';
import { getInputProps } from '../../../util/helper';
import Validation from '../../../util/validation';
import { ControlProps } from '../../../types';

export default function TextField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, InputProps = {}, format = '', id = '' } = attributes;

    const [textData, setTextData] = React.useState({
        value: attributes.value !== undefined ? attributes.value : '',
        helperText: MuiAttributes.helperText || '',
        error: false,
    });

    const getValue = (v: any) => (format ? numeral(v).format(format) : v);

    const validate = (value: any) => {
        let isValid = false;
        const { validation } = rules;
        if (validation) {
            for (let i = 0; i < validation.length; i += 1) {
                const data = validation[i];
                isValid = Validation[data.rule](value, data.value);
                if (!isValid) {
                    return { isValid: false, message: data.message };
                }
            }
        }
        return { isValid: true, message: '' };
    };

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const validator = validate(value);
        setTextData({ value, helperText: validator.message, error: !validator.isValid });
    };

    const handleOnBlur = (e: FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const formatValue = getValue(value);
        const validator = validate(formatValue);
        setTextData({ value: formatValue, helperText: validator.message, error: !validator.isValid });
        if (typeof onChange === 'function') onChange({ id, value: formatValue });
    };

    const handleOnFocus = () => { };

    // Wheel-block for numeric inputs
    const isNumberType =
        MuiAttributes?.type === 'number' ||
        attributes?.type === 'number' ||
        MuiAttributes?.inputMode === 'numeric';

    const onWheelBlock = (e: WheelEvent<HTMLDivElement>) => {
        const el = e.currentTarget as HTMLElement;
        el.blur();
        setTimeout(() => el.focus(), 0);
    };

    // Build merged input props we want to ensure exist
    const ourInputProps = {
        ...(isNumberType ? { onWheel: onWheelBlock } : {}),
        inputMode:
            (MuiAttributes?.inputProps && MuiAttributes.inputProps.inputMode) ||
            (MuiAttributes?.slotProps?.input && MuiAttributes.slotProps.input.inputMode) ||
            'numeric',
    };

    const isV6 = !!MuiAttributes?.slotProps;

    const baseAttrs = { ...MuiAttributes };

    let finalInputProps;
    let finalSlotProps;

    if (isV6) {
        const existingSlotInput = (MuiAttributes.slotProps && MuiAttributes.slotProps.input) || {};
        finalSlotProps = {
            ...(MuiAttributes.slotProps || {}),
            input: {
                ...existingSlotInput,
                ...ourInputProps,
            },
        };
        delete baseAttrs.slotProps;
    } else {
        const existingInputProps = MuiAttributes.inputProps || {};
        finalInputProps = {
            ...existingInputProps,
            ...ourInputProps,
        };
        delete baseAttrs.inputProps;
    }

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    return (
        <MuiTextField
            fullWidth
            {...baseAttrs}
            required={isMandatory}
            inputProps={!isV6 ? finalInputProps : undefined}
            slotProps={isV6 ? finalSlotProps : undefined}
            InputProps={getInputProps(InputProps)}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            value={textData.value}
            error={textData.error}
            helperText={textData.helperText}
        />
    );
}
