import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';

export default function TimePicker({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, name = 'TimePicker', id = '' } = attributes;

    const [value, setValue] = React.useState<dayjs.Dayjs | null>(attributes?.value ? dayjs(attributes?.value) : null);

    useUpdateEffect(() => {
        if (attributes?.value) setValue(dayjs(attributes?.value));
    }, [attributes?.value]);

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const MuiTimePicker = DateComponent(name);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiTimePicker
                value={value}
                onChange={(newValue: dayjs.Dayjs | null) => {
                    setValue(newValue);
                    if (onChange) onChange({ id, value: newValue });
                }}
                slotProps={{
                    textField: {
                        required: isMandatory,
                        fullWidth: true
                    }
                }}
                {...MuiAttributes}
            />
        </LocalizationProvider>
    );
}
