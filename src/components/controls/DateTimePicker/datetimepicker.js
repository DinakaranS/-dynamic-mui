import React from 'react';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import PropTypes from 'prop-types';
import { DateComponent } from '../../../util/helper';

export default function DateTimePicker({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'DateTimePicker', id = '' } = attributes;
  const [value, setValue] = React.useState(new Date());

  const MuiDateTimePicker = DateComponent(name);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateTimePicker
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange({ id, value: newValue });
        }}
        {...MuiAttributes}
        renderInput={(params) => <TextField {...params} />}
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
