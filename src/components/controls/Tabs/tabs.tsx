import React from 'react';
import { Tabs as MuiTabs, Tab, Box } from '@mui/material';
import { ControlProps } from '../../../types';
import { FormGenerator } from '../../FormGenerator';
import { v4 as uuidv4 } from 'uuid';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function Tabs({ attributes = {}, patch, onChange }: ControlProps) {
    const { MuiAttributes = {}, tabs = [] } = attributes;
    const [value, setValue] = React.useState(0);
    const guids = React.useMemo(() => tabs.map(() => uuidv4()), [tabs.length]);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <MuiTabs value={value} onChange={handleChange} {...MuiAttributes}>
                    {tabs.map((tab: any, index: number) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </MuiTabs>
            </Box>
            {tabs.map((tab: any, index: number) => (
                <CustomTabPanel key={index} value={value} index={index}>
                    <FormGenerator
                        guid={guids[index]}
                        data={tab.subFields || []}
                        patch={patch}
                        onChange={onChange}
                    />
                </CustomTabPanel>
            ))}
        </Box>
    );
}
