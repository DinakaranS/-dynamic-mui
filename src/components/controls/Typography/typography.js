import React from 'react';
import PropTypes from 'prop-types';
import MuiTypography from '@mui/material/Typography';
import { Icon, Box } from '@mui/material';
/** Typography Component */
export default function Typography({ attributes }) {
  const { MuiAttributes = {}, text = '', MuiIcon = {} } = attributes;
  if (MuiIcon && MuiIcon.icon) {
    return (
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Icon key={MuiIcon.icon} {...MuiIcon.MuiIconAttributes}>
          {MuiIcon.icon}
        </Icon>
        <MuiTypography {...MuiAttributes}>{text}</MuiTypography>
      </Box>
    );
  }
  return <MuiTypography {...MuiAttributes}>{text}</MuiTypography>;
}

Typography.propTypes = {
  /** Attributes for Typography */
  attributes: PropTypes.objectOf(PropTypes.object),
};
Typography.defaultProps = {
  attributes: {},
};
