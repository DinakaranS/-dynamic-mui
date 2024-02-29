import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';

export default function TimePicker({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'TimePicker', id = '' } = attributes;

  const [value, setValue] = React.useState(attributes?.value ? dayjs(attributes?.value) : null);

  useUpdateEffect(() => {
    if (attributes?.value) setValue(dayjs(attributes?.value));
  }, [attributes?.value]);

  const MuiTimePicker = DateComponent(name);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiTimePicker
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

TimePicker.propTypes = {
  /** Attributes for TimePicker */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
TimePicker.defaultProps = {
  attributes: {},
  onChange: null,
};
