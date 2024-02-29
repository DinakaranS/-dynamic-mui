import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';

export default function DateTimePicker({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'DateTimePicker', id = '' } = attributes;

  const [value, setValue] = React.useState(attributes?.value ? dayjs(attributes?.value) : null);

  useUpdateEffect(() => {
    if (attributes?.value) setValue(dayjs(attributes?.value));
  }, [attributes?.value]);

  const MuiDateTimePicker = DateComponent(name);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDateTimePicker
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange({ id, value: newValue });
        }}
        {...MuiAttributes}
      />
    </LocalizationProvider>
  );
}

DateTimePicker.propTypes = {
  /** Attributes for DateTimePicker */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
DateTimePicker.defaultProps = {
  attributes: {},
  onChange: null,
};
