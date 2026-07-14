import { useDroppable } from '@dnd-kit/core';
import { Box, Paper, Typography, Icon, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormGenerator, FormData, AIFill } from '../index';
import { FormField } from '../util/helper';
import { useState } from 'react';
import { useAI, AIConfigFields } from './AIContext';

interface CanvasProps {
    fields: FormField[];
    onSelectField: (id: string) => void;
    selectedId: string | null;
    onDeleteField: (id: string) => void;
}

export const Canvas = ({ fields, onSelectField, selectedId: _selectedId, onDeleteField: _onDeleteField }: CanvasProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas',
    });
    const { client } = useAI();
    const [openData, setOpenData] = useState(false);
    const [jsonData, setJsonData] = useState('');
    const [openFill, setOpenFill] = useState(false);
    const [patch, setPatch] = useState<Record<string, any>>({});

    const handleViewData = () => {
        // @ts-ignore
        const data = FormData('builder-preview');
        setJsonData(JSON.stringify(data || {}, null, 2));
        setOpenData(true);
    };

    return (
        <Box
            ref={setNodeRef}
            sx={{
                flex: 1,
                p: 5,
                bgcolor: '#f1f5f9', // Slate-100
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto',
                transition: 'background-color 0.2s',
                ...(isOver && {
                    bgcolor: 'rgba(99, 102, 241, 0.05)',
                    boxShadow: 'inset 0 0 0 2px #6366f1'
                })
            }}
        >
            <Box sx={{ maxWidth: 1024, width: '100%', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon fontSize="small">devices</Icon> Canvas Preview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {fields.length > 0 && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            startIcon={<Icon>auto_fix_high</Icon>}
                            onClick={() => setOpenFill(true)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                        >
                            AI Fill
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<Icon>data_object</Icon>}
                        onClick={handleViewData}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                        View Data
                    </Button>
                    <Box sx={{
                        px: 2,
                        py: 0.5,
                        bgcolor: 'white',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        1024px
                    </Box>
                </Box>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 1024,
                    height: 'calc(100vh - 140px)', // Fixed height to trigger scroll
                    minHeight: 600,
                    bgcolor: 'white',
                    borderRadius: 3,
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15), 0 0 0 1px rgba(0,0,0,0.02)', // Deeper shadow + subtle border
                    position: 'relative',
                    overflowY: 'auto', // Enable vertical scrolling
                    overflowX: 'hidden',
                    // Custom Scrollbar
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                    },
                    pt: 6,
                    pb: 10, // Extra padding at bottom for scrolling space
                    px: 6,
                }}
            >
                {fields.length === 0 ? (
                    <Fade in={true}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 400,
                            color: 'text.secondary',
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 3,
                            bgcolor: 'background.default'
                        }}>
                            <Box sx={{
                                p: 3,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                mb: 2,
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}>
                                <Icon sx={{ fontSize: 40, color: 'primary.main' }}>add_circle_outline</Icon>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Start Building</Typography>
                            <Typography variant="body2" sx={{ mt: 1, maxWidth: 300, textAlign: 'center', color: 'text.secondary' }}>
                                Drag components from the sidebar and drop them here to construct your form.
                            </Typography>
                        </Box>
                    </Fade>
                ) : (
                    <FormGenerator
                        guid="builder-preview"
                        data={fields}
                        patch={patch}
                        onSubmit={(data) => console.log('Preview Submit:', data)}
                        // @ts-ignore
                        formRef={null}
                        onFieldClick={(field) => {
                            // Single click intentionally disabled for selection per user request
                            console.log('Field clicked (selection disabled)', field.id);
                        }}
                        onFieldDoubleClick={(field) => {
                            // @ts-ignore
                            if (onSelectField) onSelectField(field.id || field.props?.id);
                        }}
                    />
                )}
            </Paper>

            <Dialog open={openFill} onClose={() => setOpenFill(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    <Icon sx={{ color: 'secondary.main' }}>auto_fix_high</Icon> AI Fill — paste text to populate the preview
                </DialogTitle>
                <DialogContent dividers>
                    {client ? (
                        <AIFill
                            client={client}
                            schema={fields as any}
                            onFill={(values) => { setPatch(values); setOpenFill(false); }}
                            placeholder="Paste an email, note, or details and AI will fill matching fields…"
                        />
                    ) : (
                        <AIConfigFields />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFill(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openData}
                onClose={() => setOpenData(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>Form Data</Typography>
                    <Icon
                        sx={{ cursor: 'pointer', color: 'text.secondary' }}
                        onClick={() => setOpenData(false)}
                    >
                        close
                    </Icon>
                </DialogTitle>
                <DialogContent dividers>
                    <Box
                        component="pre"
                        sx={{
                            p: 2,
                            bgcolor: '#1e293b',
                            color: '#e2e8f0',
                            borderRadius: 2,
                            overflow: 'auto',
                            my: 0,
                            fontFamily: 'Consolas, Monaco, monospace',
                            fontSize: 14
                        }}
                    >
                        {jsonData}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenData(false)} variant="outlined" color="inherit">
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            navigator.clipboard.writeText(jsonData);
                            // Optional: Show toast
                        }}
                        variant="contained"
                        color="primary"
                        startIcon={<Icon>content_copy</Icon>}
                    >
                        Copy JSON
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
