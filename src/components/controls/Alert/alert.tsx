import MuiAlert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** Alert Control — display-only informational banner. */
export default function Alert({ attributes = {} }: ControlProps) {
    const {
        severity = 'info',
        title = '',
        text = '',
        message = '',
        variant = 'standard',
        MuiAttributes = {},
    } = attributes;

    const body = text || message;
    const { sx: userSx, ...restMui } = MuiAttributes;

    const premiumSx = {
        borderRadius: '12px',
        alignItems: 'center',
        '& .MuiAlert-message': { fontWeight: 500 },
    };

    return (
        <MuiAlert severity={severity} variant={variant} {...restMui} sx={mergeSx(premiumSx as any, userSx)}>
            {title && <AlertTitle>{title}</AlertTitle>}
            {body}
        </MuiAlert>
    );
}
