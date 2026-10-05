import { useDroppable } from '@dnd-kit/core';
import { Box, Paper, Typography, Icon, Fade, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormGenerator, FormData, AIFill, AIForm } from '../index';
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
    const [openAIForm, setOpenAIForm] = useState(false);
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
                p: { xs: 2.5, md: 5 },
                bgcolor: '#eef1f8',
                backgroundImage: 'radial-gradient(rgba(100,116,139,0.28) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto',
                position: 'relative',
                transition: 'background-color 0.25s, box-shadow 0.25s',
                ...(isOver && {
                    bgcolor: 'rgba(99, 102, 241, 0.06)',
                    boxShadow: 'inset 0 0 0 2px #6366f1'
                })
            }}
        >
            <Box sx={{ maxWidth: 1024, width: '100%', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', color: 'primary.main', boxShadow: '0 2px 8px -2px rgba(15,23,42,0.15)' }}>
                        <Icon fontSize="small">devices</Icon>
                    </Box>
                    <Box sx={{ lineHeight: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem', lineHeight: 1.2 }}>
                            Canvas Preview
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Live rendering of your form
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
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
                    {fields.length > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Icon>smart_toy</Icon>}
                            onClick={() => setOpenAIForm(true)}
                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                        >
                            AIForm demo
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.5,
                        bgcolor: 'white',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}>
                        <Icon sx={{ fontSize: 14 }}>desktop_windows</Icon>
                        1024px
                    </Box>
                </Box>
            </Box>

            {/* Device frame */}
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 1024,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    height: 38,
                    bgcolor: '#ffffff',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 -1px 0 rgba(0,0,0,0.02)',
                }}
            >
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                        <Box key={c} sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: c }} />
                    ))}
                </Box>
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ px: 2, py: 0.25, borderRadius: 6, bgcolor: '#f1f5f9', color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon sx={{ fontSize: 12 }}>lock</Icon>
                        preview.localhost
                    </Box>
                </Box>
                <Box sx={{ width: 33 }} />
            </Box>

            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 1024,
                    height: 'calc(100vh - 178px)', // Fixed height to trigger scroll
                    minHeight: 560,
                    bgcolor: 'white',
                    borderBottomLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    boxShadow: '0 30px 60px -18px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.03)',
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
                            height: 420,
                            color: 'text.secondary',
                            border: '2px dashed',
                            borderColor: isOver ? 'primary.main' : 'divider',
                            borderRadius: 4,
                            bgcolor: isOver ? 'rgba(99,102,241,0.05)' : 'background.default',
                            transition: 'all 0.25s',
                        }}>
                            <Box sx={{
                                width: 84,
                                height: 84,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(236,72,153,0.14) 100%)',
                                mb: 2.5,
                                boxShadow: '0 10px 26px -10px rgba(99,102,241,0.5)',
                                transform: isOver ? 'scale(1.08)' : 'scale(1)',
                                transition: 'transform 0.25s',
                            }}>
                                <Icon sx={{ fontSize: 42, color: 'primary.main' }}>{isOver ? 'download' : 'add_circle_outline'}</Icon>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                {isOver ? 'Drop to add' : 'Start Building'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, maxWidth: 320, textAlign: 'center', color: 'text.secondary' }}>
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

            <Dialog open={openAIForm} onClose={() => setOpenAIForm(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    <Icon sx={{ color: 'primary.main' }}>smart_toy</Icon> &lt;AIForm&gt; — the drop-in consumer wrapper
                </DialogTitle>
                <DialogContent dividers>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mb: 2
                        }}>
                        One component: renders your schema as a form plus a built-in AI toolbar
                        (Generate / AI&nbsp;Fill / Review). This is what a consumer app writes in one line.
                    </Typography>
                    {client ? (
                        <AIForm
                            client={client}
                            data={fields as any}
                            guid="aiform-demo"
                            enableGenerate
                            enableFill
                            enableReview
                        />
                    ) : (
                        <AIConfigFields />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAIForm(false)}>Close</Button>
                </DialogActions>
            </Dialog>

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
                    <Typography variant="h6" sx={{
                        fontWeight: 600
                    }}>Form Data</Typography>
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
