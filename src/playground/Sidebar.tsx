import { Paper, Typography, Box, Grid, Tabs, Tab, List, ListItemButton, ListItemText, ListItemIcon, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { Icon } from '@mui/material';
import { TOOLBOX_ITEMS } from './templates';
import { COMPONENT_DOCS } from './documentation';
import React, { useState } from 'react';

const CATEGORIES = {
    'Inputs': ['textfield', 'numberfield', 'select', 'checkbox', 'switch', 'radio', 'autocomplete', 'multitextbox', 'lineitemlist', 'formrepeater', 'signature', 'locationfield', 'datetime', 'timepicker'],
    'Layout': ['group', 'accordion', 'tabs', 'divider'],
    'Display': ['typography', 'datatable', 'chip', 'list', 'imagelist', 'hyperlink'],
    'Actions': ['button'],
    'Charts': ['chart-bar', 'chart-line', 'chart-pie']
};

const DraggableItem = ({ item }: { item: any }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolbox-${item.type}`,
        data: { type: item.type, isToolbox: true },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
    } : undefined;

    return (
        <Grid size={6}
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.light', // Using alpha from theme usually
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        color: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                    },
                    height: 80,
                    justifyContent: 'center'
                }}
            >
                <Icon fontSize="medium">{item.icon}</Icon>
                <Typography variant="caption" align="center" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                    {item.label}
                </Typography>
            </Paper>
        </Grid>
    );
};

export const Sidebar = () => {
    const [tab, setTab] = useState(0);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
        setSelectedDoc(null); // Reset detail view on tab switch
    };

    const renderBuilder = () => (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            {Object.entries(CATEGORIES).map(([category, types]) => (
                <Box key={category} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, px: 0.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', fontWeight: 700 }}>
                        {category}
                    </Typography>
                    <Grid container spacing={1.5}>
                        {types.map(type => {
                            const item = TOOLBOX_ITEMS.find(t => t.type === type);
                            if (!item) return null;
                            return <DraggableItem key={type} item={item} />;
                        })}
                    </Grid>
                </Box>
            ))}
        </Box>
    );

    const renderDocsList = () => (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List component="nav" sx={{ p: 0 }}>
                {Object.entries(CATEGORIES).map(([category, types]) => (
                    <Box key={category}>
                        <Typography variant="subtitle2" sx={{ px: 2, py: 1.5, bgcolor: '#f8f9fa', color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.5px', borderBottom: '1px solid', borderColor: 'divider', textTransform: 'uppercase' }}>
                            {category}
                        </Typography>
                        {types.map(type => {
                            const item = TOOLBOX_ITEMS.find(t => t.type === type);
                            if (!item) return null;
                            return (
                                <ListItemButton
                                    key={type}
                                    onClick={() => setSelectedDoc(type)}
                                    sx={{ borderBottom: '1px solid', borderColor: 'rgba(0,0,0,0.04)' }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                                        <Icon fontSize="small">{item.icon}</Icon>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                                    />
                                    <Icon fontSize="small" sx={{ color: 'text.disabled', fontSize: 16 }}>chevron_right</Icon>
                                </ListItemButton>
                            );
                        })}
                    </Box>
                ))}
            </List>
        </Box>
    );

    const renderDocDetail = () => {
        if (!selectedDoc) return null;
        const item = TOOLBOX_ITEMS.find(t => t.type === selectedDoc);
        const doc = COMPONENT_DOCS[selectedDoc];

        return (
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                        startIcon={<Icon>arrow_back</Icon>}
                        onClick={() => setSelectedDoc(null)}
                        size="small"
                        sx={{ minWidth: 'auto', px: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                        {item?.label || selectedDoc}
                    </Typography>
                </Box>

                {doc ? (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {doc.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="caption" fontWeight={700} color="primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.5px' }}>
                                USAGE
                            </Typography>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                                    "{doc.usage}"
                                </Typography>
                            </Paper>
                        </Box>

                        <Typography variant="caption" fontWeight={700} color="primary" sx={{ display: 'block', mb: 1, letterSpacing: '0.5px' }}>
                            PROPERTIES
                        </Typography>
                        <TableContainer component={Paper} elevation={0} variant="outlined">
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Prop</TableCell>
                                        <TableCell sx={{ fontWeight: 600, fontSize: 11 }}>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(doc.props).map(([prop, desc]) => (
                                        <TableRow key={prop}>
                                            <TableCell component="th" scope="row" sx={{ fontSize: 12, fontFamily: 'monospace', color: 'secondary.main', fontWeight: 600 }}>
                                                {prop}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{desc}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                        <Icon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }}>menu_book</Icon>
                        <Typography>No documentation available for this component yet.</Typography>
                    </Box>
                )}
            </Box>
        );
    };

    return (
        <Paper elevation={0} sx={{
            width: 320,
            height: '100%',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" textColor="primary" indicatorColor="primary">
                    <Tab label="Builder" icon={<Icon fontSize="small">build</Icon>} iconPosition="start" sx={{ minHeight: 64, textTransform: 'none', fontWeight: 600 }} />
                    <Tab label="Docs" icon={<Icon fontSize="small">article</Icon>} iconPosition="start" sx={{ minHeight: 64, textTransform: 'none', fontWeight: 600 }} />
                </Tabs>
            </Box>

            {tab === 0 ? renderBuilder() : (selectedDoc ? renderDocDetail() : renderDocsList())}
        </Paper>
    );
};
