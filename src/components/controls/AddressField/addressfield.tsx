import React, { useCallback } from 'react';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

interface AddressValue {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
}

type CountryOption = { value: string; label: string };

// Small built-in fallback list of ~25 common countries.
const DEFAULT_COUNTRIES: CountryOption[] = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'MX', label: 'Mexico' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'IE', label: 'Ireland' },
    { value: 'FR', label: 'France' },
    { value: 'DE', label: 'Germany' },
    { value: 'ES', label: 'Spain' },
    { value: 'IT', label: 'Italy' },
    { value: 'NL', label: 'Netherlands' },
    { value: 'BE', label: 'Belgium' },
    { value: 'CH', label: 'Switzerland' },
    { value: 'SE', label: 'Sweden' },
    { value: 'NO', label: 'Norway' },
    { value: 'DK', label: 'Denmark' },
    { value: 'PT', label: 'Portugal' },
    { value: 'AU', label: 'Australia' },
    { value: 'NZ', label: 'New Zealand' },
    { value: 'IN', label: 'India' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japan' },
    { value: 'SG', label: 'Singapore' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'BR', label: 'Brazil' },
    { value: 'ZA', label: 'South Africa' },
];

const DEFAULT_LABELS: Required<Record<keyof AddressValue, string>> = {
    street1: 'Street address',
    street2: 'Apt, suite, etc. (optional)',
    city: 'City',
    state: 'State / Province',
    postalCode: 'Postal code',
    country: 'Country',
};

export default function AddressField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        MuiAttributes = {},
        countries,
        labels = {},
    } = attributes;

    const countryOptions: CountryOption[] =
        Array.isArray(countries) && countries.length ? countries : DEFAULT_COUNTRIES;

    const fieldLabels = { ...DEFAULT_LABELS, ...(labels as Partial<typeof DEFAULT_LABELS>) };

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const [address, setAddress] = React.useState<AddressValue>(() => ({
        street1: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        ...((attributes?.value as AddressValue) || {}),
    }));

    useUpdateEffect(() => {
        setAddress({
            street1: '',
            street2: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            ...((attributes?.value as AddressValue) || {}),
        });
    }, [attributes?.value]);

    const handleField = useCallback(
        (field: keyof AddressValue) => (event: React.ChangeEvent<HTMLInputElement>) => {
            const next = { ...address, [field]: event.target.value };
            setAddress(next);
            onChange?.({ id, value: next } as any);
        },
        [address, id, onChange],
    );

    const inputSx = mergeSx(premiumInputSx as any, MuiAttributes?.sx);

    return (
        <Grid container spacing={2} {...MuiAttributes}>
            <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    label={fieldLabels.street1}
                    required={isMandatory}
                    value={address.street1 || ''}
                    onChange={handleField('street1')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': fieldLabels.street1 }
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField
                    fullWidth
                    label={fieldLabels.street2}
                    value={address.street2 || ''}
                    onChange={handleField('street2')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': fieldLabels.street2 }
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                <TextField
                    fullWidth
                    label={fieldLabels.city}
                    required={isMandatory}
                    value={address.city || ''}
                    onChange={handleField('city')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': fieldLabels.city }
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                    fullWidth
                    label={fieldLabels.state}
                    value={address.state || ''}
                    onChange={handleField('state')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': fieldLabels.state }
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                    fullWidth
                    label={fieldLabels.postalCode}
                    value={address.postalCode || ''}
                    onChange={handleField('postalCode')}
                    sx={inputSx}
                    slotProps={{
                        htmlInput: { 'aria-label': fieldLabels.postalCode }
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    select
                    fullWidth
                    label={fieldLabels.country}
                    required={isMandatory}
                    value={address.country || ''}
                    onChange={handleField('country')}
                    sx={inputSx}
                    slotProps={{
                        select: { inputProps: { 'aria-label': fieldLabels.country } }
                    }}
                >
                    {countryOptions.map((c) => (
                        <MenuItem key={c.value} value={c.value}>
                            {c.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>
        </Grid>
    );
}
