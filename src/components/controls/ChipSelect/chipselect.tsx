import React from 'react';
import MuiChip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Icon from '@mui/material/Icon';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';

type RawOption = string | { label?: string; value?: any; icon?: string; color?: string; disabled?: boolean };

interface NormalizedOption {
    label: string;
    value: any;
    icon?: string;
    color?: string;
    disabled?: boolean;
}

const MUI_CHIP_COLORS = ['default', 'primary', 'secondary', 'error', 'info', 'success', 'warning'];

/** Coerce string | object options into a consistent shape. */
const normalizeOptions = (options: RawOption[] = []): NormalizedOption[] =>
    (Array.isArray(options) ? options : []).map((opt) => {
        if (typeof opt === 'string') return { label: opt, value: opt };
        return {
            label: opt?.label ?? String(opt?.value ?? ''),
            value: opt?.value ?? opt?.label,
            icon: opt?.icon,
            color: opt?.color,
            disabled: opt?.disabled,
        };
    });

/** Hydrate the incoming value into single (scalar) or multi (array) form. */
const normalizeValue = (raw: any, multiple: boolean, separator: string): any => {
    if (multiple) {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string' && raw.trim() !== '') {
            let sep = separator;
            if (raw.includes(separator)) sep = separator;
            else if (raw.includes(';')) sep = ';';
            else if (raw.includes(',')) sep = ',';
            return raw.split(sep).map((v) => v.trim()).filter((v) => v !== '');
        }
        if (raw == null || raw === '') return [];
        return [raw];
    }
    if (Array.isArray(raw)) return raw.length ? raw[0] : '';
    return raw ?? '';
};

/** Premium selectable-chip control supporting single and multi select. */
export default function ChipSelect({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        options = [],
        multiple = false,
        label = '',
        separator = ';',
        color: baseColor = 'primary',
        size = 'medium',
        allowDeselect = true,
        MuiAttributes = {},
        MuiStackAttributes = {},
    } = attributes;

    const opts = React.useMemo(() => normalizeOptions(options), [options]);

    const [selected, setSelected] = React.useState<any>(() =>
        normalizeValue(attributes.value, multiple, separator),
    );
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    useUpdateEffect(() => {
        const next = normalizeValue(attributes.value, multiple, separator);
        setSelected((prev: any) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    }, [attributes.value, multiple, separator]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const validate = (val: any) => {
        if (rules?.validation) {
            for (const rule of rules.validation) {
                if (rule.rule === 'mandatory' || rule.rule === 'mandatoryselect') {
                    const isEmpty = multiple ? !Array.isArray(val) || val.length === 0 : val === '' || val == null;
                    if (isEmpty) return { isValid: false, message: rule.message || 'Required' };
                }
            }
        }
        return { isValid: true, message: '' };
    };

    const emit = (nextSelected: any) => {
        const v = validate(nextSelected);
        setError(!v.isValid);
        setHelperText(v.message);

        if (typeof onChange !== 'function') return;

        if (multiple) {
            const selectedOptions = opts.filter((o) => nextSelected.includes(o.value));
            onChange({ id, value: nextSelected, option: selectedOptions });
        } else {
            const selectedOption = opts.find((o) => o.value === nextSelected) ?? null;
            onChange({ id, value: nextSelected, option: selectedOption });
        }
    };

    const isSelected = (value: any) =>
        multiple ? Array.isArray(selected) && selected.includes(value) : selected === value;

    const handleToggle = (option: NormalizedOption) => {
        if (option.disabled) return;

        let next: any;
        if (multiple) {
            const current: any[] = Array.isArray(selected) ? selected : [];
            next = current.includes(option.value)
                ? current.filter((v) => v !== option.value)
                : [...current, option.value];
        } else {
            const alreadySelected = selected === option.value;
            next = alreadySelected && allowDeselect ? '' : option.value;
        }

        setSelected(next);
        emit(next);
    };

    const resolveColor = (option: NormalizedOption): any => {
        const c = option.color ?? baseColor;
        return MUI_CHIP_COLORS.includes(c) ? c : 'default';
    };

    const customBg = (option: NormalizedOption): string | undefined => {
        const c = option.color ?? baseColor;
        return MUI_CHIP_COLORS.includes(c) ? undefined : c;
    };

    return (
        <FormControl required={isMandatory} error={error} component="fieldset" variant="standard" fullWidth>
            {label && (
                <FormLabel
                    component="legend"
                    required={isMandatory}
                    error={error}
                    sx={{ mb: 1, fontWeight: 600, fontSize: '0.9rem' }}
                >
                    {label}
                </FormLabel>
            )}

            <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                spacing={1}
                role={multiple ? 'group' : 'radiogroup'}
                aria-label={label || id || 'chip-select'}
                {...MuiStackAttributes}
            >
                {opts.map((option) => {
                    const active = isSelected(option.value);
                    const bg = customBg(option);
                    const leadingIcon = option.icon ? (
                        <Icon fontSize="small">{option.icon}</Icon>
                    ) : active ? (
                        <CheckRoundedIcon fontSize="small" />
                    ) : undefined;

                    return (
                        <MuiChip
                            key={String(option.value)}
                            size={size}
                            // User overrides first, then controlled props below win so
                            // selection/visual/interaction behaviour can't be clobbered.
                            {...MuiAttributes}
                            label={option.label}
                            clickable={!option.disabled}
                            disabled={option.disabled}
                            role={multiple ? 'checkbox' : 'radio'}
                            aria-checked={active}
                            aria-pressed={active}
                            icon={leadingIcon}
                            variant={active ? 'filled' : 'outlined'}
                            color={active ? resolveColor(option) : 'default'}
                            onClick={() => handleToggle(option)}
                            sx={{
                                borderRadius: '999px',
                                px: 0.75,
                                fontWeight: 600,
                                letterSpacing: '0.01em',
                                borderWidth: active ? 0 : 1.5,
                                cursor: option.disabled ? 'not-allowed' : 'pointer',
                                transition: 'transform .18s cubic-bezier(.4,0,.2,1), box-shadow .18s cubic-bezier(.4,0,.2,1), background-color .18s',
                                ...(active && bg
                                    ? { backgroundColor: bg, color: '#fff', '& .MuiChip-icon': { color: '#fff' } }
                                    : {}),
                                ...(active
                                    ? { boxShadow: '0 4px 12px rgba(0,0,0,0.14)' }
                                    : { backgroundColor: 'background.paper' }),
                                '&:hover': option.disabled
                                    ? {}
                                    : {
                                          transform: 'translateY(-2px)',
                                          boxShadow: active
                                              ? '0 6px 18px rgba(0,0,0,0.20)'
                                              : '0 2px 10px rgba(0,0,0,0.10)',
                                          ...(active && bg ? { backgroundColor: bg } : {}),
                                      },
                                '&:active': { transform: 'translateY(0)' },
                                ...(MuiAttributes?.sx || {}),
                            }}
                        />
                    );
                })}
                {opts.length === 0 && (
                    <Box sx={{ color: 'text.disabled', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        No options configured
                    </Box>
                )}
            </Stack>

            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
