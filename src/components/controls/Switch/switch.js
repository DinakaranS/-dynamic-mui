import React from 'react';
import PropTypes from 'prop-types';
import MuiSwitch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';

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

/** CheckBox Component */
export default function Switch({ attributes }) {
  const { MuiAttributes = {}, MuiFCLAttributes = {}, color = '' } = attributes;
  const [checked, setChecked] = React.useState(MuiAttributes.defaultChecked || false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
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
  /** Attributes for Typography */
  attributes: PropTypes.objectOf(PropTypes.object),
};
Switch.defaultProps = {
  attributes: {},
};
