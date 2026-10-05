import MuiDivider from '@mui/material/Divider';
import { ControlProps } from '../../../types';
import { mergeSx } from '../../../util/premiumStyles';

export default function Divider({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {} } = attributes;
    const { sx: dividerSx, ...restDivider } = MuiAttributes;
    return (
        <MuiDivider
            {...restDivider}
            sx={mergeSx({ borderColor: 'divider', opacity: 0.9 }, dividerSx)}
        />
    );
}
