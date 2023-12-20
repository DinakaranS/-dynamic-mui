import * as React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { BarChart } from '@mui/x-charts/BarChart';
import PropTypes from 'prop-types';

export default function Bar({ attributes }) {
  const { MuiChartAttributes = {}, id = '' } = attributes;
  return <BarChart key={id} {...MuiChartAttributes} />;
}

Bar.propTypes = {
  /** Attributes for Pie */
  attributes: PropTypes.objectOf(PropTypes.object),
};
Bar.defaultProps = {
  attributes: {},
};
