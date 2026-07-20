import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { PREMIUM_EASING, PREMIUM_RADIUS } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** NpsScale Component — a horizontal 0..N rating scale (Net Promoter Score style). */
export default function NpsScale({ attributes = {}, rules = {}, onChange, submitTick, messages }: ControlProps) {
    const {
        id = '',
        label,
        min = 0,
        max = 10,
        lowLabel = 'Not likely',
        highLabel = 'Very likely',
        MuiAttributes = {},
    } = attributes;

    const initial = typeof attributes.value === 'number' ? attributes.value : '';
    const [value, setValue] = React.useState<number | ''>(initial);
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    useUpdateEffect(() => {
        setValue(typeof attributes.value === 'number' ? attributes.value : '');
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const validate = (val: number | ''): { isValid: boolean; message: string } => {
        if (!isMandatory) return { isValid: true, message: '' };
        if (typeof val !== 'number') {
            const rule = rules?.validation?.find((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect');
            return { isValid: false, message: rule?.message || messages?.required || 'Required' };
        }
        return { isValid: true, message: '' };
    };

    useUpdateEffect(() => {
        if (submitTick) {
            const v = validate(value);
            setError(!v.isValid);
            setHelperText(v.message);
        }
    }, [submitTick]);

    const handleSelect = (n: number) => {
        setValue(n);
        const v = validate(n);
        setError(!v.isValid);
        setHelperText(v.message);
        onChange?.({ id, value: n });
    };

    const numbers: number[] = [];
    for (let n = min; n <= max; n += 1) numbers.push(n);

    return (
        <FormControl id={id} required={isMandatory} error={error} component="fieldset" sx={{ width: '100%' }}>
            {label && (
                <FormLabel sx={{ mb: 1, fontWeight: 500 }} component="legend">
                    {label}
                </FormLabel>
            )}
            <Box role="radiogroup" aria-label={label || 'nps scale'} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {numbers.map((n) => {
                    const selected = value === n;
                    return (
                        <Button
                            key={n}
                            role="radio"
                            aria-checked={selected}
                            variant={selected ? 'contained' : 'outlined'}
                            color="primary"
                            onClick={() => handleSelect(n)}
                            {...MuiAttributes}
                            sx={(theme) => ({
                                minWidth: 44,
                                height: 44,
                                px: 0,
                                fontWeight: 600,
                                borderRadius: `${PREMIUM_RADIUS}px`,
                                transition: `transform .18s ${PREMIUM_EASING}, box-shadow .18s ${PREMIUM_EASING}, background-color .18s ${PREMIUM_EASING}`,
                                ...(selected
                                    ? { boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}` }
                                    : {
                                          borderColor: alpha(theme.palette.text.primary, 0.2),
                                          '&:hover': {
                                              borderColor: theme.palette.primary.main,
                                              backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                          },
                                      }),
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    ...(selected
                                        ? { boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}` }
                                        : {
                                              borderColor: theme.palette.primary.main,
                                              backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                          }),
                                },
                                ...(MuiAttributes.sx || {}),
                            })}
                        >
                            {n}
                        </Button>
                    );
                })}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                    {lowLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {highLabel}
                </Typography>
            </Box>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
