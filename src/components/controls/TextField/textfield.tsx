/* eslint-disable react/jsx-no-duplicate-props */
import React, { ChangeEvent, FocusEvent, WheelEvent } from 'react';
import numeral from 'numeral';
import MuiTextField from '@mui/material/TextField';
import { getInputProps } from '../../../util/helper';
import Validation from '../../../util/validation';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

export default function TextField({ attributes = {}, rules = {}, onChange, submitTick, messages }: ControlProps) {
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
                const validatorFn = Validation[data.rule];
                // Unknown rule names are ignored rather than throwing.
                isValid = typeof validatorFn === 'function' ? validatorFn(value, data.value) : true;
                if (!isValid) {
                    const fallback = data.rule === 'mandatory' ? (messages?.required || 'This field is required') : '';
                    return { isValid: false, message: data.message || fallback };
                }
            }
        }
        return { isValid: true, message: '' };
    };

    // Re-run own validation against the current value on submit so an
    // untouched invalid field surfaces its error.
    useUpdateEffect(() => {
        if (submitTick) {
            const v = validate(textData.value);
            setTextData(prev => ({ ...prev, helperText: v.message, error: !v.isValid }));
        }
    }, [submitTick]);

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

    const baseAttrs = { ...MuiAttributes };

    // Adornments configured through this library's own `InputProps` schema key
    // (the `$` prefix, icons, text) — these target the Input COMPONENT.
    const ourAdornments = getInputProps(InputProps);

    // Everything the caller may have supplied under either spelling, plus our
    // own html-input attributes. These target the raw <input> ELEMENT.
    const callerHtmlInput = MuiAttributes.inputProps || MuiAttributes.slotProps?.htmlInput || {};
    const finalHtmlInput = { ...callerHtmlInput, ...ourInputProps };

    const callerInput = MuiAttributes.InputProps || MuiAttributes.slotProps?.input || {};
    const finalInput = { ...callerInput, ...ourAdornments };

    // Emit BOTH spellings, and let whichever MUI major is installed pick the
    // one it understands:
    //   v5      reads InputProps / inputProps and ignores slotProps
    //   v6, v7  read slotProps in preference, both are accepted
    //   v9      reads slotProps ONLY — the legacy props were removed and are
    //           silently ignored, which is why they cannot be relied on alone
    //
    // The previous code branched on `!!MuiAttributes.slotProps`, i.e. on
    // whether the CALLER happened to pass slotProps — not on the MUI version.
    // On v9 that meant the legacy branch produced props MUI drops on the floor,
    // and `InputProps` was passed unconditionally, so every configured
    // adornment silently disappeared. TypeScript could not catch it because
    // `MuiAttributes` is `any`, and spreading an `any` into JSX turns off
    // excess-property checking.
    //
    // v9 also splits the slots: `input` is the Input component (adornments),
    // `htmlInput` is the underlying <input> (inputMode, aria-*, min/max/step).
    const finalSlotProps = {
        ...(MuiAttributes.slotProps || {}),
        input: finalInput,
        htmlInput: finalHtmlInput,
    };

    delete baseAttrs.slotProps;
    delete baseAttrs.inputProps;
    delete baseAttrs.InputProps;

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const { sx: userSx, ...restAttrs } = baseAttrs;

    return (
        <MuiTextField
            fullWidth
            {...restAttrs}
            id={id}
            sx={mergeSx(premiumInputSx as any, userSx)}
            required={isMandatory}
            slotProps={finalSlotProps}
            // Legacy spellings for MUI v5, which predates slotProps. v6/v7
            // accept both and prefer slotProps; v9 removed them and ignores
            // them. Harmless everywhere, and the only thing keeping v5 working.
            inputProps={finalHtmlInput}
            InputProps={finalInput}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
            value={textData.value}
            error={textData.error}
            helperText={textData.helperText}
        />
    );
}
