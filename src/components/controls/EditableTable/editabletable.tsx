import React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Paper from '@mui/material/Paper';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

interface Column {
    key: string;
    label: string;
    type?: 'text' | 'number';
}

type Row = Record<string, any>;

function toRows(value: any): Row[] {
    return Array.isArray(value) ? value.map((r) => ({ ...(r || {}) })) : [];
}

export default function EditableTable({ attributes = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        columns = [],
        addLabel = 'Add row',
        label,
    } = attributes;
    const { sx: userSx, ...restMuiAttributes } = MuiAttributes;
    const cols: Column[] = Array.isArray(columns) ? columns : [];

    const [rows, setRows] = React.useState<Row[]>(() => toRows(attributes.value));

    useUpdateEffect(() => {
        setRows(toRows(attributes.value));
    }, [attributes.value]);

    const emit = (nextRows: Row[]) => {
        onChange?.({ id, value: nextRows });
    };

    const handleCellChange = (index: number, key: string, val: string) => {
        const next = rows.map((r, i) => (i === index ? { ...r, [key]: val } : r));
        setRows(next);
        emit(next);
    };

    const handleAdd = () => {
        const next = [...rows, {}];
        setRows(next);
        emit(next);
    };

    const handleRemove = (index: number) => {
        const next = rows.filter((_, i) => i !== index);
        setRows(next);
        emit(next);
    };

    return (
        <FormControl component="fieldset" fullWidth>
            {label && (
                <FormLabel component="legend" sx={{ mb: 1 }}>
                    {label}
                </FormLabel>
            )}
            <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            {cols.map((col) => (
                                <TableCell key={col.key} sx={{ fontWeight: 600 }}>
                                    {col.label}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ width: 48 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow
                                key={index}
                                sx={{
                                    transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': { backgroundColor: 'action.hover' },
                                }}
                            >
                                {cols.map((col) => (
                                    <TableCell key={col.key}>
                                        <TextField
                                            {...restMuiAttributes}
                                            type={col.type === 'number' ? 'number' : 'text'}
                                            value={row[col.key] ?? ''}
                                            onChange={(e) =>
                                                handleCellChange(index, col.key, e.target.value)
                                            }
                                            size="small"
                                            variant="standard"
                                            fullWidth
                                            sx={mergeSx(premiumInputSx as any, userSx)}
                                            slotProps={{
                                                htmlInput: {
                                                    'aria-label': `${col.label} row ${index + 1}`,
                                                }
                                            }}
                                        />
                                    </TableCell>
                                ))}
                                <TableCell align="right">
                                    <IconButton
                                        aria-label={`Remove row ${index + 1}`}
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
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
                {addLabel}
            </Button>
        </FormControl>
    );
}
