import React from 'react';
import PropTypes from 'prop-types';
import MuiCheckBox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import useUpdateEffect from '../../../util/useUpdateEffect';

/** Playground Component */
export default function CheckBox({ attributes, onChange }) {
  const { MuiAttributes = {}, MuiFCLAttributes = {}, id = '' } = attributes;
  const [checked, setChecked] = React.useState(
    MuiAttributes.defaultChecked || attributes.value || false,
  );

  useUpdateEffect(() => {
    setChecked(attributes.value);
  }, [attributes.value]);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    onChange({ id, value: event.target.checked });
  };

  return (
    <FormControlLabel
      {...MuiFCLAttributes}
      control={
        <MuiCheckBox
          checked={checked}
          onChange={handleChange}
          {...MuiAttributes}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      }
    />
  );
}

CheckBox.propTypes = {
  /** Attributes for Checkbox */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
CheckBox.defaultProps = {
  attributes: {},
  onChange: null,
};
