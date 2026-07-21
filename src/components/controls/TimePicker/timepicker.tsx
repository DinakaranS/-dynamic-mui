import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';
import dayjs from '../../../util/dayjsSetup';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';
import { premiumInputSx } from '../../../util/premiumStyles';

export default function TimePicker({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, name = 'TimePicker', id = '' } = attributes;
    const { slotProps: userSlotProps = {}, ...restMuiAttributes } = MuiAttributes;
    const { textField: userTextField = {}, ...restUserSlotProps } = userSlotProps;
    // Inherit the theme's MuiTextField size/variant so the picker lines up with
    // the plain text fields (MuiPickersTextField ignores those defaultProps).
    const theme = useTheme();
    const tfDefaults = (theme.components?.MuiTextField?.defaultProps || {}) as { size?: 'small' | 'medium'; variant?: 'outlined' | 'filled' | 'standard' };

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
                    ...restUserSlotProps,
                    textField: {
                        required: isMandatory,
                        fullWidth: true,
                        ...(tfDefaults.size ? { size: tfDefaults.size } : {}),
                        ...(tfDefaults.variant ? { variant: tfDefaults.variant } : {}),
                        sx: premiumInputSx,
                        ...userTextField,
                    }
                }}
                {...restMuiAttributes}
            />
        </LocalizationProvider>
    );
}
