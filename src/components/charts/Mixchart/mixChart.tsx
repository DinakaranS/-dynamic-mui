/* eslint-disable import/no-extraneous-dependencies */
import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';

// Lazy-load the heavy @mui/x-charts runtime pieces together. `axisClasses` is a
// value used to build sx keys, so it must be resolved inside the async factory
// rather than imported at module top-level.
const MixChartInner = React.lazy(async () => {
    const [
        { ChartContainer },
        { LinePlot },
        { BarPlot },
        { ChartsXAxis },
        { ChartsYAxis },
        { axisClasses },
    ] = await Promise.all([
        import('@mui/x-charts/ChartContainer'),
        import('@mui/x-charts/LineChart'),
        import('@mui/x-charts/BarChart'),
        import('@mui/x-charts/ChartsXAxis'),
        import('@mui/x-charts/ChartsYAxis'),
        import('@mui/x-charts/ChartsAxis'),
    ]);

    const Inner = ({
        MuiChartContainerAttributes = {},
        MuiChartXAxisAttributes = {},
        MuiChartYAxisAttributes = {},
        MuiChartSX = {},
    }: {
        MuiChartContainerAttributes?: Record<string, unknown>;
        MuiChartXAxisAttributes?: Record<string, unknown>;
        MuiChartYAxisAttributes?: Record<string, unknown>;
        MuiChartSX?: Record<string, unknown>;
    }) => (
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
    );

    return { default: Inner };
});

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
            <Suspense
                fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                    </Box>
                }
            >
                <MixChartInner
                    MuiChartContainerAttributes={MuiChartContainerAttributes}
                    MuiChartXAxisAttributes={MuiChartXAxisAttributes}
                    MuiChartYAxisAttributes={MuiChartYAxisAttributes}
                    MuiChartSX={MuiChartSX}
                />
            </Suspense>
        </Box>
    );
}
