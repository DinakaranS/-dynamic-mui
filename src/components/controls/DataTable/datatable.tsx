import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';

const DataGrid = React.lazy(() =>
    import('@mui/x-data-grid').then((m) => ({ default: m.DataGrid })),
);

export default function DataTable({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, container = {} } = attributes;
    return (
        <div {...container}>
            <Suspense
                fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                    </Box>
                }
            >
                <DataGrid {...MuiAttributes} />
            </Suspense>
        </div>
    );
}
