import React, { useEffect, useMemo, ChangeEvent } from 'react';
import MuiRadio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { Icon } from '@mui/material';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumControlLabelSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** Radio Component */
export default function Radio({ attributes = {}, rules = {}, onChange, submitTick, messages }: ControlProps) {
    const {
        MuiAttributes = {},
        MuiFCLAttributes = {},
        MuiRGAttributes = {},
        id = '',
        MuiFLAttributes = {},
        MuiFCLabels = [],
        MuiFLabel = '',
        MuiFLabelIcon = {},
    } = attributes;
    const [value, setValue] = React.useState<string>('');
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    useEffect(() => {
        if (attributes.value || MuiAttributes.defaultValue)
            setValue(attributes.value || MuiAttributes.defaultValue);
    }, []);

    useUpdateEffect(() => {
        // `?? ''` keeps the RadioGroup controlled when the value is cleared.
        setValue(attributes.value ?? '');
    }, [attributes.value]);

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const validate = (val: string) => {
        let isValid = true;
        let msg = '';
        if (rules?.validation) {
            for (const rule of rules.validation) {
                if (rule.rule === 'mandatory') {
                    if (!val) {
                        isValid = false;
                        msg = rule.message || messages?.required || 'Required';
                        break;
                    }
                }
            }
        }
        return { isValid, message: msg };
    };

    useUpdateEffect(() => {
        if (submitTick) {
            const v = validate(value);
            setError(!v.isValid);
            setHelperText(v.message);
        }
    }, [submitTick]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value;
        setValue(val);

        const v = validate(val);
        setError(!v.isValid);
        setHelperText(v.message);

        if (onChange) onChange({ id, value: val });
    };

    const FLabel = useMemo(() => {
        if (MuiFLabelIcon && MuiFLabelIcon.icon) {
            return (
                <Box sx={{ display: 'flex', width: '100%' }}>
                    {MuiFLabelIcon && MuiFLabelIcon.icon && (
                        <Icon key={MuiFLabelIcon.icon} {...MuiFLabelIcon.MuiFLabelIconAttributes}>
                            {MuiFLabelIcon.icon}
                        </Icon>
                    )}
                    <FormLabel {...MuiFLAttributes} required={isMandatory} error={error} id="radio-buttons-group-label">
                        {MuiFLabel}
                    </FormLabel>
                </Box>
            );
        }
        return (
            <FormLabel {...MuiFLAttributes} required={isMandatory} error={error} id="radio-buttons-group-label">
                {MuiFLabel}
            </FormLabel>
        );
    }, [isMandatory, error, MuiFLabel, MuiFLabelIcon, MuiFLAttributes]);

    return (
        <FormControl id={id} required={isMandatory} error={error} component="fieldset">
            {MuiFLabel && FLabel}
            <RadioGroup
                aria-labelledby="radio-buttons-group-label"
                name="radio-buttons-group"
                {...MuiRGAttributes}
                value={value}
                onChange={handleChange}
            >
                {MuiFCLabels.map((option: string | { label: string; value: string; color?: string; sx?: any }) => {
                    const isObj = typeof option !== 'string';
                    const optLabel = isObj ? option.label : option;
                    const optValue = isObj ? option.value : option;
                    // Per-option color: tints this option's radio dot and its label text,
                    // leaving the other options untouched.
                    const optColor = isObj ? option.color : undefined;
                    const optSx = isObj ? option.sx : undefined;
                    const { sx: fclSx, ...restFCL } = MuiFCLAttributes;
                    const { sx: radioSx, ...restRadio } = MuiAttributes;
                    return (
                        <FormControlLabel
                            key={optValue}
                            {...restFCL}
                            value={optValue}
                            control={(
                                <MuiRadio
                                    {...restRadio}
                                    sx={mergeSx(optColor ? { color: optColor, '&.Mui-checked': { color: optColor } } : undefined, radioSx) as any}
                                />
                            )}
                            label={optLabel}
                            sx={mergeSx(premiumControlLabelSx as any, [
                                optColor ? { '& .MuiFormControlLabel-label': { color: optColor } } : null,
                                optSx,
                                fclSx,
                            ].filter(Boolean) as any)}
                        />
                    );
                })}
            </RadioGroup>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
