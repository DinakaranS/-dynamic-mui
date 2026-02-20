import React from 'react';
import { Accordion as MuiAccordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { Icon } from '@mui/material';
import { ControlProps } from '../../../types';
import { FormGenerator } from '../../FormGenerator';
import { v4 as uuidv4 } from 'uuid';

export default function Accordion({ attributes = {}, patch, onChange }: ControlProps) {
    const { MuiAttributes = {}, label = 'Accordion', subFields = [] } = attributes;
    const guid = React.useMemo(() => uuidv4(), []);

    return (
        <MuiAccordion {...MuiAttributes}>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                <Typography>{label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
                <FormGenerator
                    guid={guid}
                    data={subFields}
                    patch={patch}
                    onChange={onChange}
                />
            </AccordionDetails>
        </MuiAccordion>
    );
}
