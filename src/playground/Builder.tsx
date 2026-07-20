import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Chip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesEditor } from './PropertiesEditor';
import { FormField } from '../util/helper';
import { TEMPLATES } from './templates';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from '@mui/material';
import { ALL_CONTROLS_TEST_DATA } from './testData';
import { AIPanel } from './AIPanel';
import { AIProvider } from './AIContext';
import { DemoGallery } from './DemoGallery';

export const Builder = () => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [view, setView] = useState<'builder' | 'demo'>('builder');
    // Require 5px of movement to start a drag, so a plain click can add instead.
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current);
    };

    // Shared add logic — used by both drag-drop and click-to-add.
    const addComponent = (type: string) => {
        if (!type) return;
        const templateList = TEMPLATES[type];
        const template = templateList ? templateList[0] : TEMPLATES['textfield'][0];
        const newItem: FormField = {
            ...template,
            // @ts-ignore
            id: uuidv4(),
            props: { ...template.props, id: uuidv4() },
        };
        // @ts-ignore
        setFields((prev) => [...prev, newItem]);
        // @ts-ignore
        setSelectedId(newItem.id || newItem.props?.id);
        // Record in "recently used" (most-recent first, de-duped, cap 6).
        try {
            const prev = JSON.parse(localStorage.getItem('dynamic-mui:recent') || '[]');
            const next = [type, ...prev.filter((t: string) => t !== type)].slice(0, 6);
            localStorage.setItem('dynamic-mui:recent', JSON.stringify(next));
        } catch { /* ignore */ }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);
        if (over && over.id === 'canvas') {
            addComponent(active.data.current?.type);
        }
    };

    // Add a specific demo variant (a full FormField) to the canvas + jump to Builder.
    const addField = (field: FormField) => {
        const newItem: FormField = {
            ...field,
            // @ts-ignore
            id: uuidv4(),
            props: { ...field.props, id: uuidv4() },
        };
        // @ts-ignore
        setFields((prev) => [...prev, newItem]);
        // @ts-ignore
        setSelectedId(newItem.id || newItem.props?.id);
        setView('builder');
    };

    // Add a whole recipe (multiple fields). Keep each field's props.id intact so
    // cross-references (formula, visibleWhen, subforms, requiredWhen) keep working.
    const addFields = (newFields: FormField[]) => {
        const withIds = newFields.map((f) => ({ ...f, id: uuidv4() }));
        // @ts-ignore
        setFields((prev) => [...prev, ...withIds]);
        setView('builder');
    };

    const handleUpdateField = (updatedField: FormField) => {
        // @ts-ignore
        const id = updatedField.id || updatedField.props?.id;
        if (!id) return;

        setFields((prev) => prev.map(f => {
            // @ts-ignore
            const fId = f.id || f.props?.id;
            return fId === id ? updatedField : f;
        }));
    };

    const handleDeleteField = (id: string) => {
        console.log('Deleting', id);
        // @ts-ignore
        setFields((prev) => prev.filter(f => (f.id || f.props?.id) !== id));
        setSelectedId(null);
    };

    const selectedField = fields.find(f => {
        // @ts-ignore
        const fId = f.id || f.props?.id;
        return fId === selectedId;
    }) || null;

    return (
        <AIProvider>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden', bgcolor: 'background.default' }}>
                <AppBar
                    position="static"
                    color="inherit"
                    elevation={0}
                    sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: 'linear-gradient(120deg, rgba(255,255,255,0.92) 0%, rgba(248,249,255,0.9) 100%)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        boxShadow: '0 1px 24px -12px rgba(15,23,42,0.25)',
                    }}
                >
                    <Toolbar variant="dense" sx={{ minHeight: 68, gap: 1, px: { xs: 2, md: 3 } }}>
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.5,
                                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                                color: 'white',
                                mr: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 18px -6px rgba(99,102,241,0.6)',
                            }}
                        >
                            <Icon fontSize="small">dashboard_customize</Icon>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1, mr: 1.5 }}>
                            <Typography
                                component="div"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: '1.05rem',
                                    letterSpacing: '-0.02em',
                                    background: 'linear-gradient(120deg, #1e293b 0%, #4338ca 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    lineHeight: 1.1,
                                }}
                            >
                                Form Builder
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1 }}>
                                dynamic-mui studio
                            </Typography>
                        </Box>
                        <Chip
                            label={`${fields.length} ${fields.length === 1 ? 'field' : 'fields'}`}
                            size="small"
                            sx={{
                                fontWeight: 600,
                                bgcolor: 'rgba(99,102,241,0.1)',
                                color: 'primary.dark',
                                border: '1px solid',
                                borderColor: 'rgba(99,102,241,0.2)',
                            }}
                        />
                        <Box sx={{ flexGrow: 1 }} />
                        <ToggleButtonGroup
                            value={view}
                            exclusive
                            size="small"
                            onChange={(_e, v) => v && setView(v)}
                            sx={{ mr: 2, bgcolor: 'rgba(99,102,241,0.06)', borderRadius: 2, p: 0.4, '& .MuiToggleButton-root': { border: 0, borderRadius: '8px !important', px: 1.75, textTransform: 'none', fontWeight: 700 } }}
                        >
                            <ToggleButton value="builder"><Icon fontSize="small" sx={{ mr: 0.5 }}>build</Icon>Builder</ToggleButton>
                            <ToggleButton value="demo"><Icon fontSize="small" sx={{ mr: 0.5 }}>auto_awesome_motion</Icon>Demo</ToggleButton>
                        </ToggleButtonGroup>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            variant="contained"
                            startIcon={<Icon>auto_awesome</Icon>}
                            onClick={() => setAiOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            Build with AI
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Icon>download</Icon>}
                            onClick={() => {
                                console.log(JSON.stringify(fields, null, 2));
                                alert('Check console for JSON output');
                            }}
                            sx={{ mr: 1 }}
                        >
                            Export JSON
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon>bug_report</Icon>}
                            onClick={() => {
                                // @ts-ignore
                                setFields(ALL_CONTROLS_TEST_DATA);
                            }}
                            sx={{
                                borderColor: 'rgba(236,72,153,0.4)',
                                color: 'secondary.dark',
                                '&:hover': { borderColor: 'secondary.main', bgcolor: 'rgba(236,72,153,0.06)' },
                            }}
                        >
                            Test All
                        </Button>
                    </Toolbar>
                </AppBar>

                {view === 'demo' ? (
                    <DemoGallery onAddField={addField} onAddFields={addFields} />
                ) : (
                    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <Sidebar onAdd={addComponent} />
                        <Canvas
                            fields={fields}
                            onSelectField={(id) => {
                                console.log('Selected field:', id);
                                setSelectedId(id);
                            }}
                            selectedId={selectedId}
                            onDeleteField={handleDeleteField}
                        />
                        <PropertiesEditor
                            field={selectedField}
                            onUpdate={handleUpdateField}
                            onDelete={handleDeleteField}
                            allFields={fields}
                            onAllFieldsChange={setFields}
                        />
                    </Box>
                )}

                <AIPanel
                    open={aiOpen}
                    onClose={() => setAiOpen(false)}
                    currentFields={fields}
                    onApply={setFields}
                />

                <DragOverlay dropAnimation={null}>
                    {activeDragItem ? (
                        <Box sx={{
                            px: 2,
                            py: 1.25,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            borderRadius: 2.5,
                            boxShadow: '0 18px 40px -8px rgba(99,102,241,0.65)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'grabbing',
                            transform: 'rotate(-2deg) scale(1.04)',
                        }}>
                            <Icon fontSize="small">drag_indicator</Icon>
                            <Typography sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{activeDragItem.type}</Typography>
                        </Box>
                    ) : null}
                </DragOverlay>
            </Box>
        </DndContext>
        </AIProvider>
    );
};
