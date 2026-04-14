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

    React.useEffect(() => {
        if (attributes.value !== undefined && attributes.value !== textData.value) {
            setTextData(prev => ({ ...prev, value: attributes.value }));
        }
    }, [attributes.value]);

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

    // Our extra input behaviors (wheel block, inputMode for numeric)
    const ourHtmlInputProps: any = {
        ...(isNumberType ? { onWheel: onWheelBlock } : {}),
    };
    if (isNumberType) {
        ourHtmlInputProps.inputMode = 'numeric';
    }

    const baseAttrs: any = { ...MuiAttributes };

    // Legacy compatibility: if the consumer passed InputProps / inputProps
    // directly on MuiAttributes (pre-v9 shape), fold them into slotProps.
    const legacyInputProps = baseAttrs.InputProps;
    const legacyHtmlInputProps = baseAttrs.inputProps;
    delete baseAttrs.InputProps;
    delete baseAttrs.inputProps;

    const existingSlot = baseAttrs.slotProps || {};
    const existingSlotInput = existingSlot.input || {};
    const existingSlotHtmlInput = existingSlot.htmlInput || {};

    const mergedInput = {
        ...legacyInputProps,
        ...existingSlotInput,
        ...getInputProps(InputProps), // adornments from ControlProps.InputProps config
    };
    const mergedHtmlInput = {
        ...legacyHtmlInputProps,
        ...existingSlotHtmlInput,
        ...ourHtmlInputProps,
    };

    const finalSlotProps: any = { ...existingSlot };
    if (Object.keys(mergedInput).length) finalSlotProps.input = mergedInput;
    if (Object.keys(mergedHtmlInput).length) finalSlotProps.htmlInput = mergedHtmlInput;
    delete baseAttrs.slotProps;

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    return (
        <MuiTextField
            fullWidth
            {...baseAttrs}
            required={isMandatory}
            slotProps={finalSlotProps}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            value={textData.value}
            error={textData.error}
            helperText={textData.helperText}
        />
    );
}
