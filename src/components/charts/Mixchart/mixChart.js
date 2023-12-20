/* eslint-disable import/no-extraneous-dependencies */
import * as React from 'react';
import Box from '@mui/material/Box';
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer';
import { LinePlot } from '@mui/x-charts/LineChart';
import { BarPlot } from '@mui/x-charts/BarChart';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import PropTypes from 'prop-types';

export default function MixChart({ attributes }) {
  const {
    id,
    MuiBoxAttributes = {},
    MuiChartContainerAttributes = {},
    MuiChartXAxisAttributes = {},
    MuiChartYAxisAttributes = {},
    MuiChartSX = {},
  } = attributes;
  return (
    <Box sx={{ width: '100%', maxWidth: 600 }} key={id} {...MuiBoxAttributes}>
      <ResponsiveChartContainer
        sx={{
          [`.${axisClasses.left} .${axisClasses.label}`]: {
            transform: 'translate(-25px, 0)',
          },
          [`.${axisClasses.right} .${axisClasses.label}`]: {
            transform: 'translate(30px, 0)',
          },
          ...MuiChartSX,
        }}
        {...MuiChartContainerAttributes}
      >
        <BarPlot />
        <LinePlot />
        <ChartsXAxis {...MuiChartXAxisAttributes} />
        <ChartsYAxis {...MuiChartYAxisAttributes} />
      </ResponsiveChartContainer>
    </Box>
  );
}

MixChart.propTypes = {
  /** Attributes for MixChart */
  attributes: PropTypes.objectOf(PropTypes.object),
};
MixChart.defaultProps = {
  attributes: {},
};
