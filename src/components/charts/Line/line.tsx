import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';
import { getMuiX } from '../../../util/muiX';

// eslint-disable-next-line import/no-extraneous-dependencies
const LazyLineChart = React.lazy(() =>
    import('@mui/x-charts/LineChart').then((m) => ({ default: m.LineChart })),
);

export default function Line({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    const Chart: any = getMuiX('LineChart') || LazyLineChart;
    return (
        <Suspense
            fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            }
        >
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Chart key={id} height={300} {...MuiChartAttributes} />
        </Suspense>
    );
}
