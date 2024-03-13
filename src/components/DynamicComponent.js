import React from 'react';
import PropTypes from 'prop-types';
import * as Controls from './controls/index';

export default function DynamicComponent(props) {
  const { map } = props;
  if (!map) return <div />;
  const CustomComponent = Controls.default[map];
  return <CustomComponent {...props} />;
}

DynamicComponent.propTypes = {
  map: PropTypes.string.isRequired,
};
