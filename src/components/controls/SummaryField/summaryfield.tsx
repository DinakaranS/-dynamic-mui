import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { premiumSurfaceSx, mergeSx } from '../../../util/premiumStyles';
// eslint-disable-next-line import/no-cycle
import { FormData } from '../../FormGenerator';
import { ControlProps } from '../../../types';

/** Stringify a single field value for display. */
const stringify = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.map(stringify).join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const isEmpty = (value: any): boolean => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'string') return value.trim() === '';
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * Read-only review panel that lists the current form's values as
 * label -> value rows. Reads live values from the shared FormGenerator store
 * via `guid`, or from an explicit `data` object (which takes precedence).
 */
export default function SummaryField({ attributes = {} }: ControlProps) {
    const {
        id = '',
        guid,
        data,
        title = 'Summary',
        labels = {},
        hideEmpty = false,
        MuiAttributes = {},
    } = attributes as any;

    const values: Record<string, any> = data ?? FormData(guid) ?? {};

    const entries = Object.entries(values).filter(
        ([, value]) => !(hideEmpty && isEmpty(value)),
    );

    return (
        <Box
            id={id}
            {...MuiAttributes}
            sx={mergeSx(
                (theme) => ({
                    ...(premiumSurfaceSx(theme) as any),
                    p: 0,
                }),
                MuiAttributes.sx,
            )}
        >
            <Box
                sx={(theme) => ({
                    px: 2,
                    py: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.action.hover,
                })}
            >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
            </Box>

            <Box
                component="dl"
                sx={{
                    m: 0,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(30%, auto) 1fr',
                    columnGap: 2,
                    rowGap: 0,
                }}
            >
                {entries.map(([key, value]) => (
                    <React.Fragment key={key}>
                        <Typography
                            component="dt"
                            variant="body2"
                            sx={(theme) => ({
                                px: 2,
                                py: 1,
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                            })}
                        >
                            {labels[key] ?? key}
                        </Typography>
                        <Typography
                            component="dd"
                            variant="body2"
                            sx={(theme) => ({
                                m: 0,
                                px: 2,
                                py: 1,
                                color: theme.palette.text.primary,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                wordBreak: 'break-word',
                            })}
                        >
                            {stringify(value)}
                        </Typography>
                    </React.Fragment>
                ))}
            </Box>
        </Box>
    );
}
