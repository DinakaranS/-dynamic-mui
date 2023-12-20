import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { LineChart } from '@mui/x-charts/LineChart';
import PropTypes from 'prop-types';

export default function Line({ attributes }) {
  const { MuiChartAttributes = {}, id = '' } = attributes;
  return <LineChart key={id} {...MuiChartAttributes} />;
}

Line.propTypes = {
  /** Attributes for Pie */
  attributes: PropTypes.objectOf(PropTypes.object),
};
Line.defaultProps = {
  attributes: {},
};
