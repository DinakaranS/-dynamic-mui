import MuiDivider from '@mui/material/Divider';
import { ControlProps } from '../../../types';

export default function Divider({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {} } = attributes;
    return <MuiDivider {...MuiAttributes} />;
}
