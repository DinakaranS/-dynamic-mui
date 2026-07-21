import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { useTheme } from '@mui/material/styles';
import dayjs from '../../../util/dayjsSetup';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { ControlProps } from '../../../types';
import { premiumInputSx } from '../../../util/premiumStyles';

export default function DateTime({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { MuiAttributes = {}, name = 'DatePicker', id = '' } = attributes;
    // Let consumers customize the picker's slots (e.g. the textField's label
    // behavior) without clobbering the control's own defaults.
    const { slotProps: userSlotProps = {}, ...restMuiAttributes } = MuiAttributes;
    const { textField: userTextField = {}, ...restUserSlotProps } = userSlotProps;

    // The picker renders a `MuiPickersTextField`, which does NOT inherit the
    // theme's `MuiTextField` defaultProps. So if a consumer's theme sets text
    // fields to e.g. size="small", the picker would stay medium and tower over
    // the fields beside it. Inherit those defaults here so the picker's height
    // and variant always match the plain text fields around it.
    const theme = useTheme();
    const tfDefaults = (theme.components?.MuiTextField?.defaultProps || {}) as { size?: 'small' | 'medium'; variant?: 'outlined' | 'filled' | 'standard' };

    const [value, setValue] = React.useState<dayjs.Dayjs | null>(attributes?.value ? dayjs(attributes?.value) : null);

    useUpdateEffect(() => {
        if (attributes?.value) setValue(dayjs(attributes?.value));
    }, [attributes?.value]);

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    const MuiDateTime = DateComponent(name);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MuiDateTime
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
                        // Match the ambient TextField size/variant so the picker's
                        // height lines up with the fields around it.
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
