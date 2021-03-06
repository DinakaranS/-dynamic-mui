import React from 'react';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import PropTypes from 'prop-types';
import { DateComponent } from '../../../util/helper';

export default function TimePicker({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'TimePicker', id = '' } = attributes;
  const [value, setValue] = React.useState(new Date());

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
        renderInput={(params) => <TextField {...params} />}
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
