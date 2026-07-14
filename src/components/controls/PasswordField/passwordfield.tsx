import React, { ChangeEvent, FocusEvent } from 'react';
import MuiTextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Validation from '../../../util/validation';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** 0/25/50/75/100 strength score based on length + char classes. */
const scoreStrength = (value: string): number => {
    let score = 0;
    if (value.length >= 8) score += 25;
    if (/[0-9]/.test(value)) score += 25;
    if (/[A-Z]/.test(value)) score += 25;
    if (/[^A-Za-z0-9]/.test(value)) score += 25;
    return score;
};

const strengthColor = (score: number): 'error' | 'warning' | 'info' | 'success' => {
    if (score <= 25) return 'error';
    if (score <= 50) return 'warning';
    if (score <= 75) return 'info';
    return 'success';
};

export default function PasswordField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, id = '', showStrength = false } = attributes;

    const [value, setValue] = React.useState<string>(
        attributes.value !== undefined ? attributes.value : '',
    );
    const [helperText, setHelperText] = React.useState<string>(MuiAttributes.helperText || '');
    const [error, setError] = React.useState<boolean>(false);
    const [showPassword, setShowPassword] = React.useState<boolean>(false);

    useUpdateEffect(() => {
        setValue(attributes.value !== undefined ? attributes.value : '');
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const validate = (val: any) => {
        const { validation } = rules;
        if (validation) {
            for (let i = 0; i < validation.length; i += 1) {
                const data = validation[i];
                const validatorFn = Validation[data.rule];
                const isValid = typeof validatorFn === 'function' ? validatorFn(val, data.value) : true;
                if (!isValid) {
                    return { isValid: false, message: data.message || '' };
                }
            }
        }
        return { isValid: true, message: '' };
    };

    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        const validator = validate(next);
        setValue(next);
        setHelperText(validator.message);
        setError(!validator.isValid);
    };

    const handleOnBlur = (e: FocusEvent<HTMLInputElement>) => {
        const next = e.target.value;
        const validator = validate(next);
        setHelperText(validator.message);
        setError(!validator.isValid);
        if (typeof onChange === 'function') onChange({ id, value: next });
    };

    const { sx: userSx, ...restAttrs } = MuiAttributes as any;

    const score = scoreStrength(value || '');

    return (
        <Box sx={{ width: '100%' }}>
            <MuiTextField
                fullWidth
                {...restAttrs}
                type={showPassword ? 'text' : 'password'}
                sx={mergeSx(premiumInputSx as any, userSx)}
                required={isMandatory}
                value={value}
                error={error}
                helperText={helperText}
                onChange={handleOnChange}
                onBlur={handleOnBlur}
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    onClick={() => setShowPassword(prev => !prev)}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
            {showStrength ? (
                <LinearProgress
                    variant="determinate"
                    value={score}
                    color={strengthColor(score)}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                />
            ) : null}
        </Box>
    );
}
