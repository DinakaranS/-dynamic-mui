import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Box, Divider, Stack, Icon, Tabs, Tab,
} from '@mui/material';
import { AIFormGenerator, AIVisionImport, AISchemaReview } from '../ai';
import { FormField } from '../util/helper';
import { useAI, AIConfigFields } from './AIContext';

interface AIPanelProps {
    open: boolean;
    onClose: () => void;
    currentFields: FormField[];
    onApply: (fields: FormField[]) => void;
}

/** Playground-only panel: generate / digitize / review a form with AI. */
export const AIPanel = ({ open, onClose, currentFields, onApply }: AIPanelProps) => {
    const { client } = useAI();
    const [tab, setTab] = useState(0);

    const apply = (fields: FormField[]) => {
        if (fields && fields.length) {
            onApply(fields);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <Icon sx={{ color: 'primary.main' }}>auto_awesome</Icon>
                Build with AI
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2.5}>
                    <AIConfigFields />

                    {client && (
                        <>
                            <Divider />
                            <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="fullWidth">
                                <Tab label="Generate" />
                                <Tab label="From image" />
                                <Tab label="Review" />
                            </Tabs>

                            {tab === 0 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                        {currentFields.length ? 'Describe changes to the current form' : 'Describe your form'}
                                    </Typography>
                                    <AIFormGenerator
                                        client={client}
                                        current={currentFields.length ? (currentFields as any) : undefined}
                                        onGenerate={(f) => apply(f as FormField[])}
                                        placeholder={currentFields.length
                                            ? 'e.g. add a phone field and make email required'
                                            : 'e.g. a patient intake form with name, DOB, insurance, and symptoms'}
                                    />
                                </Box>
                            )}

                            {tab === 1 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                        Digitize a form from an image
                                    </Typography>
                                    <AIVisionImport client={client} mode="generate" onGenerate={(f) => apply(f as FormField[])} />
                                </Box>
                            )}

                            {tab === 2 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                                        Audit the current form and apply improvements
                                    </Typography>
                                    {currentFields.length ? (
                                        <AISchemaReview
                                            client={client}
                                            schema={currentFields as any}
                                            onApply={(f) => apply(f as FormField[])}
                                        />
                                    ) : (
                                        <Typography variant="body2" sx={{
                                            color: "text.secondary"
                                        }}>
                                            Add some fields first, then review them.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
