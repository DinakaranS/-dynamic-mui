// @ts-nocheck
import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';

// eslint-disable-next-line import/no-extraneous-dependencies
const BarChart = React.lazy(() =>
    import('@mui/x-charts/BarChart').then((m) => ({ default: m.BarChart })),
);

export default function Bar({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    return (
        <Suspense
            fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            }
        >
            <BarChart key={id} {...MuiChartAttributes} />
        </Suspense>
    );
}
