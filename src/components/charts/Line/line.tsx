import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';

// eslint-disable-next-line import/no-extraneous-dependencies
const LineChart = React.lazy(() =>
    import('@mui/x-charts/LineChart').then((m) => ({ default: m.LineChart })),
);

export default function Line({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    return (
        <Suspense
            fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            }
        >
            <LineChart key={id} height={300} {...MuiChartAttributes} />
        </Suspense>
    );
}
