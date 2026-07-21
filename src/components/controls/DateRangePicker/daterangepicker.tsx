import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import dayjs from '../../../util/dayjsSetup';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';
import { premiumInputSx } from '../../../util/premiumStyles';

type Range = { start: dayjs.Dayjs | null; end: dayjs.Dayjs | null };

/** Normalize the many accepted value shapes into a { start, end } dayjs pair. */
function parseValue(value: any): Range {
    if (!value) return { start: null, end: null };
    let start: any;
    let end: any;
    if (typeof value === 'string') {
        [start, end] = value.split('~');
    } else if (Array.isArray(value)) {
        [start, end] = value;
    } else if (typeof value === 'object') {
        start = value.start;
        end = value.end;
    }
    return {
        start: start ? dayjs(start) : null,
        end: end ? dayjs(end) : null,
    };
}

/** DateRangePicker Component — two DatePickers (Start + End) laid out in a row. */
export default function DateRangePicker({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        format = 'MM/DD/YYYY',
        startLabel = 'Start',
        endLabel = 'End',
    } = attributes;

    // Inherit the theme's MuiTextField size/variant so the pickers line up with
    // the plain text fields (MuiPickersTextField ignores those defaultProps).
    const theme = useTheme();
    const tfDefaults = (theme.components?.MuiTextField?.defaultProps || {}) as { size?: 'small' | 'medium'; variant?: 'outlined' | 'filled' | 'standard' };
    const tfInherit = {
        ...(tfDefaults.size ? { size: tfDefaults.size } : {}),
        ...(tfDefaults.variant ? { variant: tfDefaults.variant } : {}),
    };

    const [range, setRange] = React.useState<Range>(() => parseValue(attributes.value));

    useUpdateEffect(() => {
        setRange(parseValue(attributes.value));
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some((v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect') || false;

    const hasOrderError =
        !!range.start && !!range.end && range.start.isValid() && range.end.isValid() && range.end.isBefore(range.start);

    const emit = (next: Range) => {
        if (!onChange) return;
        const start = next.start && next.start.isValid() ? next.start.format(format) : null;
        const end = next.end && next.end.isValid() ? next.end.format(format) : null;
        onChange({ id, value: { start, end }, option: format });
    };

    const handleStart = (newValue: dayjs.Dayjs | null) => {
        const next = { ...range, start: newValue };
        setRange(next);
        emit(next);
    };

    const handleEnd = (newValue: dayjs.Dayjs | null) => {
        const next = { ...range, end: newValue };
        setRange(next);
        emit(next);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={2}>
                <DatePicker
                    label={startLabel}
                    format={format}
                    value={range.start}
                    onChange={handleStart}
                    slotProps={{
                        textField: {
                            required: isMandatory,
                            fullWidth: true,
                            ...tfInherit,
                            sx: premiumInputSx as any,
                        },
                    }}
                    {...MuiAttributes}
                />
                <DatePicker
                    label={endLabel}
                    format={format}
                    value={range.end}
                    onChange={handleEnd}
                    slotProps={{
                        textField: {
                            required: isMandatory,
                            fullWidth: true,
                            ...tfInherit,
                            error: hasOrderError,
                            helperText: hasOrderError ? 'End date must be on or after the start date' : undefined,
                            sx: premiumInputSx as any,
                        },
                    }}
                    {...MuiAttributes}
                />
            </Stack>
        </LocalizationProvider>
    );
}
