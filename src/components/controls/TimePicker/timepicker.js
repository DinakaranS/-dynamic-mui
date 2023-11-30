import React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';

export default function TimePicker({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'TimePicker', id = '', MuiTextAttributes } = attributes;

  const [value, setValue] = React.useState(
    attributes?.value ? new Date(attributes?.value) : new Date(),
  );

  useUpdateEffect(() => {
    if (attributes?.value) setValue(new Date(attributes?.value));
  }, [attributes?.value]);

  const MuiTimePicker = DateComponent(name);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiTimePicker
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange({ id, value: newValue });
        }}
        {...MuiAttributes}
        renderInput={(params) => <TextField {...params} {...MuiTextAttributes} />}
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
