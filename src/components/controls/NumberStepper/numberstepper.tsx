import React from 'react';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

const toNumber = (v: any, fallback = 0): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
};

export default function NumberStepper({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        min,
        max,
        step = 1,
        label,
    } = attributes;
    const { sx: userSx, ...restMuiAttributes } = MuiAttributes;

    const hasMin = min !== undefined && min !== null;
    const hasMax = max !== undefined && max !== null;

    const clamp = (n: number): number => {
        let out = n;
        if (hasMin) out = Math.max(out, toNumber(min));
        if (hasMax) out = Math.min(out, toNumber(max));
        return out;
    };

    const [value, setValue] = React.useState<number>(() => clamp(toNumber(attributes.value, 0)));
    // Raw text while the user types (allows transient empty / partial input).
    const [text, setText] = React.useState<string>(String(value));

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    useUpdateEffect(() => {
        const next = clamp(toNumber(attributes.value, 0));
        setValue(next);
        setText(String(next));
    }, [attributes.value]);

    const commit = (n: number) => {
        const clamped = clamp(n);
        setValue(clamped);
        setText(String(clamped));
        onChange?.({ id, value: clamped });
    };

    const atMin = hasMin && value <= toNumber(min);
    const atMax = hasMax && value >= toNumber(max);

    const handleDecrement = () => {
        if (atMin) return;
        commit(value - toNumber(step, 1));
    };

    const handleIncrement = () => {
        if (atMax) return;
        commit(value + toNumber(step, 1));
    };

    const handleBlur = () => {
        commit(toNumber(text, value));
    };

    const buttonSx = {
        borderRadius: 0,
        px: 1.25,
        color: 'text.primary',
        transition: 'background-color .18s',
        '&:hover': (theme: any) => ({
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
        }),
        '&.Mui-disabled': { color: 'text.disabled' },
    };

    return (
        <FormControl component="fieldset" error={false}>
            {label && (
                <FormLabel component="legend" required={isMandatory} sx={{ mb: 1 }}>
                    {label}
                </FormLabel>
            )}
            <Stack
                direction="row"
                sx={mergeSx(
                    (theme: any) => ({
                        // `alignItems` was a Stack system prop before v9. Folded
                        // into the base style object rather than left in an sx
                        // array — mergeSx already returns SxProps, and SxProps
                        // arrays cannot be nested inside another sx array.
                        alignItems: 'center',
                        display: 'inline-flex',
                        width: 'fit-content',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.16)}`,
                        backgroundColor: theme.palette.background.paper,
                        transition: 'box-shadow .2s, border-color .2s',
                        '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                        },
                        '&:focus-within': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
                        },
                    }),
                    userSx,
                )}>
                <IconButton
                    aria-label="decrement"
                    onClick={handleDecrement}
                    disabled={atMin}
                    size="small"
                    sx={buttonSx}
                >
                    <RemoveIcon fontSize="small" />
                </IconButton>
                <InputBase
                    {...restMuiAttributes}
                    value={text}
                    inputProps={{
                        'aria-label': label || id || 'value',
                        inputMode: 'numeric',
                        style: { textAlign: 'center', width: 56 },
                    }}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={handleBlur}
                    sx={{
                        '& input': { py: 0.75 },
                    }}
                />
                <IconButton
                    aria-label="increment"
                    onClick={handleIncrement}
                    disabled={atMax}
                    size="small"
                    sx={buttonSx}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Stack>
            {isMandatory && (
                <FormHelperText sx={{ mx: 0 }}>{''}</FormHelperText>
            )}
        </FormControl>
    );
}
