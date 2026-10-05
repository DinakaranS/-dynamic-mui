import MuiChip from '@mui/material/Chip';
import { ControlProps } from '../../../types';
import { premiumChipSx, mergeSx } from '../../../util/premiumStyles';

export default function Chip({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, label = 'Chip' } = attributes;
    const { sx: chipSx, ...restChip } = MuiAttributes;
    return <MuiChip label={label} {...restChip} sx={mergeSx(premiumChipSx as any, chipSx)} />;
}
