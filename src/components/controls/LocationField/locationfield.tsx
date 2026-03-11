import React, { ChangeEvent, FocusEvent } from 'react';
import numeral from 'numeral';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Icon } from '@mui/material';
import { getInputProps } from '../../../util/helper';
import Validation from '../../../util/validation';
import { ControlProps } from '../../../types';

type ButtonDisplay = 'text' | 'icon' | 'both';

export default function LocationField({ attributes = {}, rules = {}, onChange }: ControlProps) {
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
                const isValid = Validation[data.rule](value, data.value);
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

    // Handle MUI v5 vs v6 inputProps/slotProps
    const isV6 = !!MuiAttributes?.slotProps;
    const baseAttrs = { ...MuiAttributes };

    let finalInputProps;
    let finalSlotProps;

    if (isV6) {
        const existingSlotInput = (MuiAttributes.slotProps && MuiAttributes.slotProps.input) || {};
        finalSlotProps = {
            ...(MuiAttributes.slotProps || {}),
            input: { ...existingSlotInput },
        };
        delete baseAttrs.slotProps;
    } else {
        const existingInputProps = MuiAttributes.inputProps || {};
        finalInputProps = { ...existingInputProps };
        delete baseAttrs.inputProps;
    }

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
                    required={isMandatory}
                    inputProps={!isV6 ? finalInputProps : undefined}
                    slotProps={isV6 ? finalSlotProps : undefined}
                    InputProps={getInputProps(InputProps)}
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
