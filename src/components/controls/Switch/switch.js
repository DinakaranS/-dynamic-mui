import React from 'react';
import PropTypes from 'prop-types';
import MuiSwitch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { alpha, experimentalStyled as styled } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';

const ColorSwitch = styled(({ color, ...other }) => <MuiSwitch {...other} />)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: (props) => props.color || 'green',
    '&:hover': {
      backgroundColor: (props) => alpha(props.color || 'green', theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: (props) => props.color || 'green',
  },
}));

/** Switch Component */
export default function Switch({ attributes, onChange }) {
  const { MuiAttributes = {}, MuiFCLAttributes = {}, color = '', id = '' } = attributes;
  const [checked, setChecked] = React.useState(
    MuiAttributes.defaultValue || attributes.value || false,
  );
  useUpdateEffect(() => {
    setChecked(attributes.value);
  }, [attributes.value]);

  const handleChange = (event) => {
    setChecked(event.target.checked);
    onChange({ id, value: event.target.checked });
  };

  const MSwitch = color ? ColorSwitch : MuiSwitch;

  return (
    <FormControlLabel
      {...MuiFCLAttributes}
      control={
        <MSwitch
          checked={checked}
          onChange={handleChange}
          {...MuiAttributes}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      }
    />
  );
}

Switch.propTypes = {
  /** Attributes for Switch */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
Switch.defaultProps = {
  attributes: {},
  onChange: null,
};
