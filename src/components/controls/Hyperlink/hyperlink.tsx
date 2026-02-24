import { Box, Link, Typography } from '@mui/material';
import { ControlProps } from '../../../types';

export default function Hyperlink({ attributes = {}, rules = {} }: ControlProps) {
    const {
        label = '',
        value = '', // fallback URL
        MuiAttributes = {},
        url = '', // Explicit url attribute if provided
        target = '_blank',
        displayText = '' // What to show instead of URL, if any
    } = attributes;

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;
    const finalUrl = url || value || '#';
    const finalLabel = displayText || label || finalUrl;

    return (
        <Box sx={{ width: '100%', ...MuiAttributes.sx }}>
            {label && displayText && (
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex' }}>
                    {label}
                    {isMandatory && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
                </Typography>
            )}

            <Link
                href={finalUrl as string}
                target={target}
                rel={target === '_blank' ? "noopener noreferrer" : undefined}
                {...MuiAttributes}
            >
                {finalLabel}
            </Link>
        </Box>
    );
}
