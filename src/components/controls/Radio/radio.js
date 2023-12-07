import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import MuiRadio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Icon } from '@mui/material';
import useUpdateEffect from '../../../util/useUpdateEffect';

/** Radio Component */
export default function Radio({ attributes, onChange }) {
  const {
    MuiAttributes = {},
    MuiFCLAttributes = {},
    MuiRGAttributes = {},
    id = '',
    MuiFLAttributes = {},
    MuiFCLabels = [],
    MuiFLabel = '',
    MuiFLabelIcon = {},
  } = attributes;
  const [value, setValue] = React.useState('');

  useEffect(() => {
    if (attributes.value || MuiAttributes.defaultValue)
      setValue(attributes.value || MuiAttributes.defaultValue);
  }, []);

  useUpdateEffect(() => {
    setValue(attributes.value);
  }, [attributes.value]);

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange({ id, value: event.target.value });
  };

  const FLabel = useMemo(() => {
    if (MuiFLabelIcon && MuiFLabelIcon.icon) {
      return (
        <Box sx={{ display: 'flex', width: '100%' }}>
          {MuiFLabelIcon && MuiFLabelIcon.icon && (
            <Icon key={MuiFLabelIcon.icon} {...MuiFLabelIcon.MuiFLabelIconAttributes}>
              {MuiFLabelIcon.icon}
            </Icon>
          )}
          <FormLabel {...MuiFLAttributes} id="radio-buttons-group-label">
            {MuiFLabel}
          </FormLabel>
        </Box>
      );
    }
    return (
      <FormLabel {...MuiFLAttributes} id="radio-buttons-group-label">
        {MuiFLabel}
      </FormLabel>
    );
  }, []);

  return (
    <FormControl>
      {MuiFLabel && FLabel}
      <RadioGroup
        aria-labelledby="radio-buttons-group-label"
        name="radio-buttons-group"
        {...MuiRGAttributes}
        value={value}
        onChange={handleChange}
      >
        {MuiFCLabels.map((label) => (
          <FormControlLabel
            {...MuiFCLAttributes}
            value={label}
            control={<MuiRadio {...MuiAttributes} />}
            label={label}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

Radio.propTypes = {
  /** Attributes for Radio */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Function */
  onChange: PropTypes.func,
};
Radio.defaultProps = {
  attributes: {},
  onChange: null,
};
