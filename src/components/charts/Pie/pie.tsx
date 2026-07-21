// @ts-nocheck
import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';

// eslint-disable-next-line import/no-extraneous-dependencies
const PieChart = React.lazy(() =>
    import('@mui/x-charts/PieChart').then((m) => ({ default: m.PieChart })),
);

export default function Pie({ attributes = {} }: ControlProps) {
    const { MuiChartAttributes = {}, id = '' } = attributes;
    return (
        <Suspense
            fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                </Box>
            }
        >
            <PieChart key={id} height={300} {...MuiChartAttributes} />
        </Suspense>
    );
}
