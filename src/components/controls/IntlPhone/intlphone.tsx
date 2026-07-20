import React from 'react';
import { PatternFormat } from 'react-number-format';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

interface Country {
    code: string;
    name: string;
    dial: string;
    flag: string;
}

const COUNTRIES: Country[] = [
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
    { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
    { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
    { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
    { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
    { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
    { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
    { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
    { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
    { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
    { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
    { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
    { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
    { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
    { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
    { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
    { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
    { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷' },
    { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷' },
    { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
    { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱' },
];

/** Split an incoming "+44 1234" style value into a country code + local number. */
function parseValue(value: any, fallbackCode: string): { code: string; number: string } {
    if (typeof value === 'string' && value.trim()) {
        // Longest dial match wins (e.g. +1 vs +971).
        const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
        const match = sorted.find((c) => value.startsWith(c.dial));
        if (match) {
            return { code: match.code, number: value.slice(match.dial.length).trim() };
        }
    }
    return { code: fallbackCode, number: '' };
}

export default function IntlPhone({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        defaultCountry = 'US',
        label,
        MuiAttributes = {},
    } = attributes;
    const { sx: userSx, ...restMuiAttributes } = MuiAttributes;

    const fallback = COUNTRIES.some((c) => c.code === defaultCountry) ? defaultCountry : 'US';
    const initial = parseValue(attributes.value, fallback);

    const [code, setCode] = React.useState(initial.code);
    const [number, setNumber] = React.useState(initial.number);

    useUpdateEffect(() => {
        const parsed = parseValue(attributes.value, fallback);
        setCode(parsed.code);
        setNumber(parsed.number);
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const emit = (nextCode: string, nextNumber: string) => {
        const c = COUNTRIES.find((x) => x.code === nextCode) || COUNTRIES[0];
        onChange?.({
            id,
            value: `${c.dial} ${nextNumber}`.trim(),
            option: { country: c.code, dial: c.dial, number: nextNumber },
        });
    };

    const handleCountry = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setCode(next);
        emit(next, number);
    };

    const handleNumber = (v: { value: string }) => {
        setNumber(v.value);
        emit(code, v.value);
    };

    return (
        <FormControl component="fieldset" fullWidth>
            {label && (
                <FormLabel component="legend" required={isMandatory} sx={{ mb: 1 }}>
                    {label}
                </FormLabel>
            )}
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField
                    select
                    value={code}
                    onChange={handleCountry}
                    size="small"
                    label="Country"
                    aria-label="Country dial code"
                    SelectProps={{
                        renderValue: (val: any) => {
                            const c = COUNTRIES.find((x) => x.code === val) || COUNTRIES[0];
                            return `${c.flag} ${c.dial}`;
                        },
                    }}
                    sx={mergeSx(premiumInputSx as any, {
                        minWidth: 120,
                        flexShrink: 0,
                        ...(userSx as object),
                    })}
                >
                    {COUNTRIES.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.dial})
                        </MenuItem>
                    ))}
                </TextField>
                <PatternFormat
                    customInput={TextField}
                    format="### ### ####"
                    mask="_"
                    value={number}
                    onValueChange={handleNumber}
                    fullWidth
                    required={isMandatory}
                    label="Phone number"
                    id={id}
                    name="intlphone"
                    {...restMuiAttributes}
                    sx={mergeSx(premiumInputSx as any, userSx)}
                />
            </Stack>
        </FormControl>
    );
}
