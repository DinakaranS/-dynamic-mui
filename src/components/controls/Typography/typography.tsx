import MuiTypography from '@mui/material/Typography';
import { Icon, Box } from '@mui/material';
import { ControlProps } from '../../../types';

/** Typography Component */
export default function Typography({ attributes = {} }: ControlProps) {
    const { MuiAttributes = {}, text = '', MuiIcon = {}, value = '', MuiBox = {} } = attributes;
    if (MuiIcon && MuiIcon.icon) {
        return (
            <Box sx={{ display: 'flex', width: '100%' }} {...MuiBox}>
                <Icon key={MuiIcon.icon} {...MuiIcon.MuiIconAttributes}>
                    {MuiIcon.icon}
                </Icon>
                <MuiTypography {...MuiAttributes}>{text || value}</MuiTypography>
            </Box>
        );
    }
    return <MuiTypography {...MuiAttributes}>{text || value}</MuiTypography>;
}
