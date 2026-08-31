import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

const DEFAULT_COLOR = '#000000';

/** ColorPicker Control — a colour swatch, a native colour input and a hex field. */
export default function ColorPicker({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { id = '', label, presets = [], MuiAttributes = {} } = attributes;
    const { sx: muiSx, ...otherMuiAttributes } = MuiAttributes;

    const [value, setValue] = React.useState<string>(
        (attributes.value as string) || DEFAULT_COLOR,
    );

    useUpdateEffect(() => {
        setValue((attributes.value as string) || DEFAULT_COLOR);
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const emit = (hex: string) => {
        setValue(hex);
        onChange?.({ id, value: hex });
    };

    const handleColorInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        emit(event.target.value);
    };

    const handleHexInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        emit(event.target.value);
    };

    const handlePreset = (hex: string) => {
        emit(hex);
    };

    const swatchBase = {
        width: 44,
        height: 44,
        borderRadius: '10px',
        border: (theme: any) => `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
        boxShadow: (theme: any) => `0 2px 8px ${alpha(theme.palette.common.black, 0.12)}`,
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
    } as any;

    return (
        <FormControl required={isMandatory} component="fieldset" fullWidth>
            {label && <FormLabel component="legend">{label}</FormLabel>}
            <Stack
                direction="row"
                spacing={1.5}
                sx={{
                    alignItems: "center",
                    mt: label ? 1 : 0
                }}>
                <Box sx={{ ...swatchBase, backgroundColor: value }}>
                    <input
                        type="color"
                        aria-label={label ? `${label} colour` : 'colour'}
                        value={value}
                        onChange={handleColorInput}
                        {...otherMuiAttributes}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                        }}
                    />
                </Box>
                <TextField
                    id={id || undefined}
                    value={value}
                    onChange={handleHexInput}
                    size="small"
                    label="Hex"
                    sx={mergeSx(premiumInputSx as any, mergeSx({ maxWidth: 160 } as any, muiSx))}
                    slotProps={{
                        htmlInput: { 'aria-label': 'hex value' }
                    }}
                />
            </Stack>
            {Array.isArray(presets) && presets.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', rowGap: 1 }}>
                    {presets.map((preset: string) => (
                        <Box
                            key={preset}
                            role="button"
                            aria-label={`preset ${preset}`}
                            onClick={() => handlePreset(preset)}
                            sx={{
                                width: 26,
                                height: 26,
                                borderRadius: '8px',
                                backgroundColor: preset,
                                cursor: 'pointer',
                                flexShrink: 0,
                                border: (theme: any) =>
                                    value === preset
                                        ? `2px solid ${theme.palette.primary.main}`
                                        : `1px solid ${alpha(theme.palette.text.primary, 0.2)}`,
                                boxShadow: (theme: any) =>
                                    `0 1px 4px ${alpha(theme.palette.common.black, 0.12)}`,
                            }}
                        />
                    ))}
                </Stack>
            )}
        </FormControl>
    );
}
