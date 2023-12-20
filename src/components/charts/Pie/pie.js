import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PieChart } from '@mui/x-charts/PieChart';
import PropTypes from 'prop-types';

export default function Pie({ attributes }) {
  const { MuiChartAttributes = {}, id = '' } = attributes;
  return <PieChart key={id} {...MuiChartAttributes} />;
}

Pie.propTypes = {
  /** Attributes for Pie */
  attributes: PropTypes.objectOf(PropTypes.object),
};
Pie.defaultProps = {
  attributes: {},
};
