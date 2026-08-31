import React from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

interface Row {
    key: string;
    value: string;
}

/** Normalize an incoming value (object map or array of {key,value}) into rows. */
function toRows(value: any): Row[] {
    if (Array.isArray(value)) {
        return value.map((r: any) => ({
            key: r?.key ?? '',
            value: r?.value ?? '',
        }));
    }
    if (value && typeof value === 'object') {
        return Object.keys(value).map((k) => ({ key: k, value: String(value[k] ?? '') }));
    }
    return [];
}

/** Collapse rows into an object map { key: value }, skipping blank keys. */
function toMap(rows: Row[]): Record<string, string> {
    const map: Record<string, string> = {};
    rows.forEach((r) => {
        if (r.key !== '') {
            map[r.key] = r.value;
        }
    });
    return map;
}

export default function KeyValueField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        keyLabel = 'Key',
        valueLabel = 'Value',
        label,
    } = attributes;
    const { sx: userSx, ...restMuiAttributes } = MuiAttributes;

    const [rows, setRows] = React.useState<Row[]>(() => toRows(attributes.value));

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    useUpdateEffect(() => {
        setRows(toRows(attributes.value));
    }, [attributes.value]);

    const emit = (nextRows: Row[]) => {
        onChange?.({ id, value: toMap(nextRows), option: nextRows });
    };

    const handleCellChange = (index: number, field: keyof Row, val: string) => {
        const next = rows.map((r, i) => (i === index ? { ...r, [field]: val } : r));
        setRows(next);
        emit(next);
    };

    const handleAdd = () => {
        const next = [...rows, { key: '', value: '' }];
        setRows(next);
        emit(next);
    };

    const handleRemove = (index: number) => {
        const next = rows.filter((_, i) => i !== index);
        setRows(next);
        emit(next);
    };

    const hasError = isMandatory && rows.filter((r) => r.key !== '').length === 0;

    return (
        <FormControl component="fieldset" error={hasError} fullWidth>
            {label && (
                <FormLabel component="legend" required={isMandatory} sx={{ mb: 1 }}>
                    {label}
                </FormLabel>
            )}
            <Stack spacing={1.25}>
                {rows.map((row, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: "center"
                        }}
                    >
                        <TextField
                            {...restMuiAttributes}
                            label={keyLabel}
                            value={row.key}
                            onChange={(e) => handleCellChange(index, 'key', e.target.value)}
                            size="small"
                            fullWidth
                            sx={mergeSx(premiumInputSx as any, userSx)}
                        />
                        <TextField
                            {...restMuiAttributes}
                            label={valueLabel}
                            value={row.value}
                            onChange={(e) => handleCellChange(index, 'value', e.target.value)}
                            size="small"
                            fullWidth
                            sx={mergeSx(premiumInputSx as any, userSx)}
                        />
                        <IconButton
                            aria-label={`Remove ${row.key || 'row'}`}
                            onClick={() => handleRemove(index)}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main' },
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ))}
            </Stack>
            <Button
                onClick={handleAdd}
                startIcon={<AddIcon />}
                size="small"
                variant="text"
                sx={{
                    alignSelf: 'flex-start',
                    mt: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                }}
            >
                Add
            </Button>
            {hasError && (
                <FormHelperText>
                    {rules?.validation?.find(
                        (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
                    )?.message || 'At least one entry is required'}
                </FormHelperText>
            )}
        </FormControl>
    );
}
