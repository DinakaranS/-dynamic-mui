import React from 'react';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import PropTypes from 'prop-types';
import { DateComponent } from '../../../util/helper';

export default function DateTime({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'DatePicker', id = '' } = attributes;
  const [value, setValue] = React.useState(new Date());

  const MuiDateTime = DateComponent(name);
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateTime
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

DateTime.propTypes = {
  /** Attributes for DateTime */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};

DateTime.defaultProps = {
  attributes: {},
  onChange: null,
};
