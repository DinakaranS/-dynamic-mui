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
import { ControlProps } from '../../../types';

/** Radio Component */
export default function Radio({ attributes = {}, rules = {}, onChange }: ControlProps) {
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
        setValue(attributes.value);
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
                        msg = rule.message || 'Required';
                        break;
                    }
                }
            }
        }
        return { isValid, message: msg };
    };

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
        <FormControl required={isMandatory} error={error} component="fieldset">
            {MuiFLabel && FLabel}
            <RadioGroup
                aria-labelledby="radio-buttons-group-label"
                name="radio-buttons-group"
                {...MuiRGAttributes}
                value={value}
                onChange={handleChange}
            >
                {MuiFCLabels.map((label: string) => (
                    <FormControlLabel
                        key={label}
                        {...MuiFCLAttributes}
                        value={label}
                        control={<MuiRadio {...MuiAttributes} />}
                        label={label}
                    />
                ))}
            </RadioGroup>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
