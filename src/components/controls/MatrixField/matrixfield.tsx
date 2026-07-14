import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumSurfaceSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

interface MatrixRow {
    id: string;
    label: string;
}

interface MatrixColumn {
    value: string;
    label: string;
}

const normalizeRows = (rows: any[]): MatrixRow[] =>
    (rows || []).map((r: any) =>
        typeof r === 'string' ? { id: r, label: r } : { id: String(r.id), label: r.label ?? String(r.id) }
    );

const normalizeColumns = (cols: any[]): MatrixColumn[] =>
    (cols || []).map((c: any) =>
        typeof c === 'string'
            ? { value: c, label: c }
            : { value: String(c.value), label: c.label ?? String(c.value) }
    );

/** MatrixField Component — a survey grid of questions (rows) × options (columns). */
export default function MatrixField({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        rows = [],
        columns = [],
        multiple = false,
        label = '',
    } = attributes as any;

    const normRows = React.useMemo(() => normalizeRows(rows), [rows]);
    const normCols = React.useMemo(() => normalizeColumns(columns), [columns]);

    const [answers, setAnswers] = React.useState<Record<string, any>>(attributes.value || {});
    const [error, setError] = React.useState(false);
    const [helperText, setHelperText] = React.useState('');

    useUpdateEffect(() => {
        setAnswers(attributes.value || {});
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const validate = (next: Record<string, any>) => {
        let isValid = true;
        let msg = '';
        if (isMandatory) {
            const answered = normRows.every((row) => {
                const v = next[row.id];
                return multiple ? Array.isArray(v) && v.length > 0 : v !== undefined && v !== null && v !== '';
            });
            if (!answered) {
                isValid = false;
                const rule = rules?.validation?.find(
                    (r: any) => r.rule === 'mandatory' || r.rule === 'mandatoryselect'
                );
                msg = rule?.message || 'Required';
            }
        }
        return { isValid, message: msg };
    };

    const emit = (next: Record<string, any>) => {
        setAnswers(next);
        const v = validate(next);
        setError(!v.isValid);
        setHelperText(v.message);
        onChange?.({ id, value: next, option: next });
    };

    const handleSingle = (rowId: string, colValue: string) => {
        emit({ ...answers, [rowId]: colValue });
    };

    const handleMultiple = (rowId: string, colValue: string, checked: boolean) => {
        const current: string[] = Array.isArray(answers[rowId]) ? answers[rowId] : [];
        const nextForRow = checked ? [...current, colValue] : current.filter((c) => c !== colValue);
        emit({ ...answers, [rowId]: nextForRow });
    };

    const isSelected = (rowId: string, colValue: string) => {
        const v = answers[rowId];
        if (multiple) return Array.isArray(v) && v.includes(colValue);
        return v === colValue;
    };

    const { sx: userSx, ...restMui } = MuiAttributes;

    return (
        <FormControl required={isMandatory} error={error} component="fieldset" fullWidth>
            {label && (
                <FormLabel required={isMandatory} error={error} sx={{ mb: 1, fontWeight: 600 }}>
                    {label}
                </FormLabel>
            )}
            <TableContainer
                sx={mergeSx(premiumSurfaceSx as any, { width: '100%' })}
            >
                <Table size="small" {...restMui} sx={userSx}>
                    <TableHead>
                        <TableRow
                            sx={(theme) => ({
                                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                            })}
                        >
                            <TableCell sx={{ fontWeight: 700 }} />
                            {normCols.map((col) => (
                                <TableCell key={col.value} align="center" sx={{ fontWeight: 700 }}>
                                    {col.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {normRows.map((row) => (
                            <TableRow
                                key={row.id}
                                hover
                                sx={(theme) => ({
                                    transition: 'background-color .18s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                    },
                                })}
                            >
                                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                    {row.label}
                                </TableCell>
                                {normCols.map((col) => (
                                    <TableCell key={col.value} align="center" padding="checkbox">
                                        {multiple ? (
                                            <Checkbox
                                                checked={isSelected(row.id, col.value)}
                                                onChange={(e) =>
                                                    handleMultiple(row.id, col.value, e.target.checked)
                                                }
                                                inputProps={{
                                                    'aria-label': `${row.label} ${col.label}`,
                                                }}
                                            />
                                        ) : (
                                            <Radio
                                                name={`matrix-${id}-${row.id}`}
                                                checked={isSelected(row.id, col.value)}
                                                onChange={() => handleSingle(row.id, col.value)}
                                                inputProps={{
                                                    'aria-label': `${row.label} ${col.label}`,
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
