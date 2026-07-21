// @ts-nocheck
import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';
import { getMuiX } from '../../../util/muiX';

// eslint-disable-next-line import/no-extraneous-dependencies
const LazyBarChart = React.lazy(() =>
    import('@mui/x-charts/BarChart').then((m) => ({ default: m.BarChart })),
);

export default function Bar({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    // Use a Pro chart if configured via configureMuiX({ BarChart }); else Community.
    const Chart: any = getMuiX('BarChart') || LazyBarChart;
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
