/* eslint-disable import/no-extraneous-dependencies */
import Box from '@mui/material/Box';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { LinePlot } from '@mui/x-charts/LineChart';
import { BarPlot } from '@mui/x-charts/BarChart';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { ControlProps } from '../../../types';

export default function MixChart({ attributes = {} }: ControlProps) {
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
            <ChartContainer
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
            </ChartContainer>
        </Box>
    );
}
