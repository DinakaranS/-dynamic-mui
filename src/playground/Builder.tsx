import { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { PropertiesEditor } from './PropertiesEditor';
import { FormField } from '../util/helper';
import { TEMPLATES } from './templates';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from '@mui/material';
import { ALL_CONTROLS_TEST_DATA } from './testData';

export const Builder = () => {
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<any>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragItem(event.active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragItem(null);

        if (over && over.id === 'canvas') {
            const type = active.data.current?.type;
            if (type) {
                // Direct lookup by type key (lowercase)
                const templateList = TEMPLATES[type];
                // Default to first template or a generic fallback
                const template = templateList ? templateList[0] : TEMPLATES['textfield'][0];

                const newItem: FormField = {
                    ...template,
                    // @ts-ignore
                    id: uuidv4(),
                    props: {
                        ...template.props,
                        id: uuidv4(),
                    }
                };
                // @ts-ignore
                setFields((prev) => [...prev, newItem]);
                // @ts-ignore
                setSelectedId(newItem.id || newItem.props?.id);
            }
        }
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
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
                <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'white/80', backdropFilter: 'blur(8px)' }}>
                    <Toolbar variant="dense" sx={{ minHeight: 64 }}>
                        <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', mr: 2, display: 'flex' }}>
                            <Icon fontSize="small">dashboard</Icon>
                        </Box>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.5px' }}>
                            Dynamic Form Builder
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Icon>download</Icon>}
                            onClick={() => {
                                console.log(JSON.stringify(fields, null, 2));
                                alert('Check console for JSON output');
                            }}
                            sx={{ mr: 1, borderRadius: 2 }}
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
                        >
                            Test All
                        </Button>
                    </Toolbar>
                </AppBar>

                <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <Sidebar />
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

                <DragOverlay>
                    {activeDragItem ? (
                        <Box sx={{
                            p: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: 2,
                            boxShadow: 4,
                            width: 150,
                            textAlign: 'center'
                        }}>
                            <Typography>{activeDragItem.type}</Typography>
                        </Box>
                    ) : null}
                </DragOverlay>
            </Box>
        </DndContext>
    );
};
