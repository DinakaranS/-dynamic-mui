import React from 'react';
import PropTypes from 'prop-types';
/** Typography Component */
export default function Typography(props) {
  const { library, component, attributes } = props;
  const TYPOGRAPHY = library[component];
  const { MuiAttributes = {}, text = '' } = attributes;
  return <TYPOGRAPHY {...MuiAttributes}>{text}</TYPOGRAPHY>;
}

Typography.propTypes = {
  /** Attributes for Typography */
  attributes: PropTypes.objectOf(PropTypes.object),
  /** Library to be used */
  library: PropTypes.objectOf(PropTypes.object),
  /** Component name */
  component: PropTypes.string.isRequired,
};
Typography.defaultProps = {
  attributes: {},
  library: {},
};
