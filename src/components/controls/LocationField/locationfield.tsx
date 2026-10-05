import React, { ChangeEvent, FocusEvent } from 'react';
import numeral from 'numeral';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Icon } from '@mui/material';
import { getInputProps } from '../../../util/helper';
import Validation from '../../../util/validation';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';

type ButtonDisplay = 'text' | 'icon' | 'both';

export default function LocationField({ attributes = {}, rules = {}, onChange, submitTick, messages }: ControlProps) {
    const {
        id = '',
        MuiAttributes = {},
        InputProps = {},
        format = '',
        buttonText = 'Update Location',
        buttonIcon = 'location_on',
        buttonDisplay = 'both' as ButtonDisplay,
        MuiButtonAttributes = {},
        disabled = false,
    } = attributes;

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
        const { validation } = rules;
        if (validation) {
            for (let i = 0; i < validation.length; i += 1) {
                const data = validation[i];
                const validatorFn = Validation[data.rule];
                const isValid = typeof validatorFn === 'function' ? validatorFn(value, data.value) : true;
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

    const handleButtonClick = () => {
        if (onChange) {
            onChange({ id, value: textData.value, option: 'location_update_request' });
        }
    };

    const renderButtonContent = () => {
        const display: ButtonDisplay = buttonDisplay;
        const iconEl = <Icon>{buttonIcon}</Icon>;

        switch (display) {
            case 'icon':
                return iconEl;
            case 'text':
                return <>{buttonText}</>;
            case 'both':
            default:
                return (
                    <>
                        {iconEl}
                        <Box component="span" sx={{ ml: 0.5 }}>{buttonText}</Box>
                    </>
                );
        }
    };

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    // Input props across MUI majors. Same approach as TextField: emit both
    // spellings and let the installed major take the one it understands.
    // v5 reads InputProps/inputProps; v6 and v7 accept both and prefer
    // slotProps; v9 removed the legacy props and reads slotProps only.
    // The old `isV6` flag tested whether the CALLER passed slotProps, not the
    // MUI version, so on v9 the adornments were silently dropped.
    const baseAttrs = { ...MuiAttributes };

    const finalHtmlInput = MuiAttributes.inputProps || MuiAttributes.slotProps?.htmlInput || {};
    const finalInput = {
        ...(MuiAttributes.InputProps || MuiAttributes.slotProps?.input || {}),
        ...getInputProps(InputProps),
    };
    const finalSlotProps = {
        ...(MuiAttributes.slotProps || {}),
        input: finalInput,
        htmlInput: finalHtmlInput,
    };

    delete baseAttrs.slotProps;
    delete baseAttrs.inputProps;
    delete baseAttrs.InputProps;

    // Determine field height based on variant + size for button alignment
    const variant = MuiAttributes.variant || 'outlined';
    const size = MuiAttributes.size || 'medium';
    // Standard/filled medium=56, small=48; outlined medium=56, small=40
    const fieldHeight = size === 'small' ? (variant === 'outlined' ? 40 : 48) : 56;

    return (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <MuiTextField
                    fullWidth
                    {...baseAttrs}
                    id={id}
                    required={isMandatory}
                    slotProps={finalSlotProps}
                    inputProps={finalHtmlInput}
                    InputProps={finalInput}
                    onChange={handleOnChange}
                    onBlur={handleOnBlur}
                    value={textData.value}
                    error={textData.error}
                    helperText={textData.helperText}
                    disabled={disabled}
                />
            </Box>
            <Button
                variant="outlined"
                color="primary"
                size={size === 'small' ? 'small' : 'medium'}
                onClick={handleButtonClick}
                disabled={disabled}
                {...MuiButtonAttributes}
                sx={{
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                    height: fieldHeight,
                    flexShrink: 0,
                    ...MuiButtonAttributes?.sx,
                }}
            >
                {renderButtonContent()}
            </Button>
        </Box>
    );
}
