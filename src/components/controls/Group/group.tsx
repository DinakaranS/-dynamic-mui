import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { ControlProps } from '../../../types';
import { FormGenerator } from '../../FormGenerator';
import { v4 as uuidv4 } from 'uuid';

export default function Group({ attributes = {}, patch, onChange }: ControlProps) {
    const { MuiAttributes = {}, label = 'Group', subFields = [] } = attributes;
    // Generate a unique GUID for this nested form generator if not present
    const guid = React.useMemo(() => uuidv4(), []);

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 2, ...MuiAttributes.sx }} {...MuiAttributes}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                {label}
            </Typography>
            <Box>
                <FormGenerator
                    guid={guid}
                    data={subFields}
                    patch={patch}
                    // Pass changes up. Note: nested data structure handling is complex. 
                    // For now, we flatten or let FormGenerator handle its own state. 
                    // Ideally, we'd prefix IDs.
                    onChange={onChange}
                />
            </Box>
        </Paper>
    );
}
