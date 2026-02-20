import MuiChip from '@mui/material/Chip';
import { ControlProps } from '../../../types';

export default function Chip({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, label = 'Chip' } = attributes;
    return <MuiChip label={label} {...MuiAttributes} />;
}
