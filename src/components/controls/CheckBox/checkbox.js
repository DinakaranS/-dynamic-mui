import React from 'react';
import PropTypes from 'prop-types';
import MuiCheckBox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

/** CheckBox Component */
export default function CheckBox({ attributes, onChange }) {
  const { MuiAttributes = {}, MuiFCLAttributes = {}, id = '' } = attributes;
  const [checked, setChecked] = React.useState(MuiAttributes.defaultChecked || false);

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
  /** Attributes for Typography */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
CheckBox.defaultProps = {
  attributes: {},
  onChange: null,
};
