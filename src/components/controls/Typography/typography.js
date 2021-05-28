import React from 'react';
import PropTypes from 'prop-types';
import MuiTypography from '@material-ui/core/Typography';
/** Typography Component */
export default function Typography({ attributes }) {
  const { MuiAttributes = {}, text = '' } = attributes;
  return <MuiTypography {...MuiAttributes}>{text}</MuiTypography>;
}

Typography.propTypes = {
  /** Attributes for Typography */
  attributes: PropTypes.objectOf(PropTypes.object),
};
Typography.defaultProps = {
  attributes: {},
};
