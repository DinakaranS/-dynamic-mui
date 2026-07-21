// @ts-nocheck
import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';
import { getMuiX } from '../../../util/muiX';

// eslint-disable-next-line import/no-extraneous-dependencies
const LazyPieChart = React.lazy(() =>
    import('@mui/x-charts/PieChart').then((m) => ({ default: m.PieChart })),
);

export default function Pie({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    const Chart: any = getMuiX('PieChart') || LazyPieChart;
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
