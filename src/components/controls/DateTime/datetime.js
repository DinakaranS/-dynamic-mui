import React from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { DateComponent } from '../../../util/helper';
import useUpdateEffect from '../../../util/useUpdateEffect';

export default function DateTime({ attributes, onChange }) {
  const { MuiAttributes = {}, name = 'DatePicker', id = '' } = attributes;

  const [value, setValue] = React.useState(attributes?.value ? dayjs(attributes?.value) : null);

  useUpdateEffect(() => {
    if (attributes?.value) setValue(dayjs(attributes?.value));
  }, [attributes?.value]);

  const MuiDateTime = DateComponent(name);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiDateTime
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
