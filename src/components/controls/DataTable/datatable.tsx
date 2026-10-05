import React, { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { ControlProps } from '../../../types';
import { getMuiX } from '../../../util/muiX';

const LazyDataGrid = React.lazy(() =>
    import('@mui/x-data-grid').then((m) => ({ default: m.DataGrid })),
);

export default function DataTable({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, container = {} } = attributes;
    // Use a Pro/Premium grid if configured via configureMuiX({ DataGrid }); else Community.
    const DataGrid: any = getMuiX('DataGrid') || LazyDataGrid;
    return (
        <div {...container}>
            <Suspense
                fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                    </Box>
                }
            >
                {/* rows/columns defaults first so a sparse config can't crash the grid
                    (@mui/x-data-grid has no default for `columns`). */}
                {/* eslint-disable-next-line react-hooks/static-components */}
                <DataGrid rows={[]} columns={[]} {...MuiAttributes} />
            </Suspense>
        </div>
    );
}
