import React from 'react';
import TextField from '@material-ui/core/TextField';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';
import { DateComponent } from '../../../util/helper';

export default function DateRangePicker({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'DateRangePicker', id = '' } = attributes;
  const [value, setValue] = React.useState([null, null]);
  const MuiDateRangePicker = DateComponent(name);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDateRangePicker
        {...MuiAttributes}
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange({ id, value: newValue });
        }}
        renderInput={(startProps, endProps) => (
          <>
            <TextField {...startProps} />
            <Box sx={{ mx: 2 }}> to </Box>
            <TextField {...endProps} />
          </>
        )}
      />
    </LocalizationProvider>
  );
}

DateRangePicker.propTypes = {
  /** Attributes for Date Range */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
DateRangePicker.defaultProps = {
  attributes: {},
  onChange: null,
};
