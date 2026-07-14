import MuiButton from '@mui/material/Button';
import { Icon } from '@mui/material';
import { ControlProps } from '../../../types';
import { mergeSx } from '../../../util/premiumStyles';

/** Premium sx for the Button control (merged with any user-provided sx). */
const premiumButtonSx = {
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    boxShadow: 'none',
    transition: 'transform .18s, box-shadow .18s',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
};

/** Button Component */
export default function Button({ attributes = {}, onChange }: ControlProps) {
    const {
        MuiAttributes = {},
        id = '',
        text = 'Button',
        action = 'button',
        icon,
    } = attributes;

    const { sx: userSx, ...rest } = MuiAttributes;

    const handleClick = () => {
        if (onChange) onChange({ id, value: 'click', option: action });
    };

    return (
        <MuiButton
            variant="contained"
            {...rest}
            type={action}
            onClick={handleClick}
            startIcon={icon ? <Icon>{icon}</Icon> : rest.startIcon}
            sx={mergeSx(premiumButtonSx as any, userSx)}
        >
            {text}
        </MuiButton>
    );
}
