import { Paper, Typography, Box, Grid, Tabs, Tab, List, ListItemButton, ListItemText, ListItemIcon, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, InputAdornment, Collapse, Tooltip } from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { Icon } from '@mui/material';
import { TOOLBOX_ITEMS } from './templates';
import { COMPONENT_DOCS } from './documentation';
import React, { useEffect, useState } from 'react';

// Render a label with the matched search substring emphasised.
const highlight = (text: string, q: string): React.ReactNode => {
    const query = (q || '').trim();
    if (!query) return text;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return text;
    return (
        <>
            {text.slice(0, i)}
            <Box component="span" sx={{ bgcolor: '#fde68a', borderRadius: '3px', color: '#78350f' }}>
                {text.slice(i, i + query.length)}
            </Box>
            {text.slice(i + query.length)}
        </>
    );
};

const readRecent = (): string[] => {
    try { return JSON.parse(localStorage.getItem('dynamic-mui:recent') || '[]'); } catch { return []; }
};

export const CATEGORIES: Record<string, string[]> = {
    'Inputs': ['textfield', 'numberfield', 'numberstepper', 'password', 'phone', 'intlphone', 'currency', 'otp', 'select', 'cascadeselect', 'asyncautocomplete', 'checkbox', 'switch', 'radio', 'chipselect', 'togglebuttons', 'rating', 'slider', 'nps', 'tagsinput', 'keyvalue', 'matrix', 'editabletable', 'colorpicker', 'markdown', 'richtext', 'address', 'consent', 'autocomplete', 'multitextbox', 'lineitemlist', 'formrepeater', 'signature', 'fileupload', 'locationfield', 'geo', 'datetime', 'datetimepicker', 'daterangepicker', 'timepicker'],
    'Layout': ['group', 'accordion', 'tabs', 'divider', 'formwizard'],
    'Display': ['typography', 'datatable', 'chip', 'list', 'imagelist', 'hyperlink', 'alert', 'computed', 'summary'],
    'Actions': ['button'],
    'Charts': ['bar', 'line', 'pie', 'mixchart']
};

// One rich gradient per CATEGORY — cohesive and meaningful (colour = category),
// rich icon tiles without turning the palette into a rainbow.
export const CATEGORY_META: Record<string, { color: string; icon: string; grad: [string, string] }> = {
    'Inputs': { color: '#6366f1', icon: 'edit_note', grad: ['#6366f1', '#8b5cf6'] },
    'Layout': { color: '#f59e0b', icon: 'dashboard', grad: ['#f59e0b', '#f97316'] },
    'Display': { color: '#10b981', icon: 'visibility', grad: ['#10b981', '#14b8a6'] },
    'Actions': { color: '#ec4899', icon: 'bolt', grad: ['#ec4899', '#f43f5e'] },
    'Charts': { color: '#0ea5e9', icon: 'insights', grad: ['#0ea5e9', '#3b82f6'] },
};

// Resolve a control type's category gradient (for the recently-used strip).
const gradOfType = (type: string): [string, string] => {
    const entry = Object.entries(CATEGORIES).find(([, types]) => types.includes(type));
    return entry ? CATEGORY_META[entry[0]].grad : ['#6366f1', '#8b5cf6'];
};

const DraggableItem = ({ item, colors, onAdd, query }: { item: any; colors: [string, string]; onAdd?: (type: string) => void; query: string }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `toolbox-${item.type}`,
        data: { type: item.type, isToolbox: true },
    });
    const [from] = colors;
    const doc = COMPONENT_DOCS[item.type]?.description;

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
          <Tooltip
            title={<Box sx={{ py: 0.25 }}><b>{item.label}</b>{doc ? <><br />{doc}</> : null}<br /><span style={{ opacity: 0.7 }}>Drag or click to add</span></Box>}
            placement="right"
            arrow
            enterDelay={400}
          >
            <Paper
                elevation={0}
                onClick={() => onAdd?.(item.type)}
                sx={{
                    position: 'relative',
                    p: 1.25,
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.9,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .dm-tile': {
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    // NOTE: don't `transform` the tile on hover. It's the hover
                    // target itself, so moving it can slip it out from under the
                    // cursor at a viewport edge → hover flip-flops → continuous
                    // jitter (worsened by the tooltip). A shadow gives the same
                    // "lift" feel without changing the hit box.
                    '&:hover': {
                        borderColor: `${from}66`,
                        boxShadow: '0 12px 24px -14px rgba(15,23,42,0.28)',
                    },
                    // On hover, the neutral tile gently picks up the category colour.
                    '&:hover .dm-tile': {
                        bgcolor: `${from}16`,
                        borderColor: `${from}44`,
                    },
                    '&:active': {
                        cursor: 'grabbing',
                        transform: 'translateY(-1px) scale(0.99)',
                    },
                    height: 92,
                    justifyContent: 'center',
                }}
            >
                <Box
                    className="dm-tile"
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: from,
                        bgcolor: 'grey.100',
                        border: '1px solid',
                        borderColor: 'grey.200',
                    }}
                >
                    <Icon fontSize="small">{item.icon}</Icon>
                </Box>
                <Typography variant="caption" align="center" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'text.primary' }}>
                    {highlight(item.label, query)}
                </Typography>
            </Paper>
          </Tooltip>
        </Grid>
    );
};

export const Sidebar = ({ onAdd }: { onAdd?: (type: string) => void }) => {
    const [tab, setTab] = useState(0);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [search, setSearch] = useState(() => {
        try { return localStorage.getItem('dynamic-mui:search') || ''; } catch { return ''; }
    });
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
        try { return JSON.parse(localStorage.getItem('dynamic-mui:collapsed') || '{}'); } catch { return {}; }
    });
    useEffect(() => { try { localStorage.setItem('dynamic-mui:search', search); } catch { /* ignore */ } }, [search]);
    useEffect(() => { try { localStorage.setItem('dynamic-mui:collapsed', JSON.stringify(collapsed)); } catch { /* ignore */ } }, [collapsed]);

    const toggleCategory = (category: string) =>
        setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
    const allCollapsed = Object.keys(CATEGORIES).every((c) => collapsed[c]);
    const toggleAll = () => {
        const next: Record<string, boolean> = {};
        Object.keys(CATEGORIES).forEach((c) => { next[c] = !allCollapsed; });
        setCollapsed(next);
    };

    const totalCount = Object.values(CATEGORIES).reduce((n, types) => n + types.length, 0);
    const recentItems = readRecent()
        .map((type) => TOOLBOX_ITEMS.find((t) => t.type === type))
        .filter((it): it is NonNullable<typeof it> => !!it)
        .slice(0, 6);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
        setSelectedDoc(null); // Reset detail view on tab switch
    };

    // Filter helper: matches an item by label or type against the search query
    const matchesSearch = (item: any) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (item.label || '').toLowerCase().includes(q) || (item.type || '').toLowerCase().includes(q);
    };

    const renderBuilder = () => {
        const matchCount = Object.values(CATEGORIES).reduce((n, types) =>
            n + types.filter(type => {
                const it = TOOLBOX_ITEMS.find(t => t.type === type);
                return it && matchesSearch(it);
            }).length, 0);
        const anyMatch = matchCount > 0;

        return (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search components…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Icon fontSize="small" sx={{ color: 'text.disabled' }}>search</Icon>
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position="end">
                                        <Icon
                                            fontSize="small"
                                            sx={{ color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
                                            onClick={() => setSearch('')}
                                        >
                                            close
                                        </Icon>
                                    </InputAdornment>
                                ) : undefined,
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {search.trim() ? `${matchCount} result${matchCount === 1 ? '' : 's'}` : `${totalCount} components`}
                        </Typography>
                        <Box
                            onClick={toggleAll}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.25, cursor: 'pointer', color: 'primary.main', fontSize: '0.72rem', fontWeight: 700, '&:hover': { opacity: 0.8 } }}
                        >
                            <Icon sx={{ fontSize: 16 }}>{allCollapsed ? 'unfold_more' : 'unfold_less'}</Icon>
                            {allCollapsed ? 'Expand all' : 'Collapse all'}
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pb: 2 }}>
                    {!search.trim() && recentItems.length > 0 && (
                        <Box sx={{ mb: 2.5 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px', fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
                                <Icon sx={{ fontSize: 15 }}>history</Icon> Recently used
                            </Typography>
                            <Grid container spacing={1.25}>
                                {recentItems.map(item => (
                                    <DraggableItem key={`recent-${item.type}`} item={item} colors={gradOfType(item.type)} onAdd={onAdd} query="" />
                                ))}
                            </Grid>
                        </Box>
                    )}
                    {Object.entries(CATEGORIES).map(([category, types]) => {
                        const meta = CATEGORY_META[category] || { color: '#6366f1', icon: 'category' };
                        const items = types
                            .map(type => TOOLBOX_ITEMS.find(t => t.type === type))
                            .filter((item): item is NonNullable<typeof item> => !!item && matchesSearch(item));
                        if (items.length === 0) return null;
                        const open = search.trim() ? true : !collapsed[category];
                        const [gFrom, gTo] = meta.grad;
                        return (
                            <Box key={category} sx={{ mb: 2 }}>
                                <Box
                                    onClick={() => toggleCategory(category)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1.1, mb: 1.5, px: 1, py: 0.75,
                                        borderRadius: 2, cursor: 'pointer', userSelect: 'none',
                                        position: 'sticky', top: 0, zIndex: 2,
                                        bgcolor: 'background.paper',
                                        transition: 'background-color .18s',
                                        '&:hover': { bgcolor: `${gFrom}0d` },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 26, height: 26, borderRadius: 2,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff',
                                            background: `linear-gradient(135deg, ${gFrom} 0%, ${gTo} 100%)`,
                                            boxShadow: `0 4px 10px -3px ${gFrom}99, inset 0 1px 0 rgba(255,255,255,0.3)`,
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 16 }}>{meta.icon}</Icon>
                                    </Box>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ color: gFrom, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.6px', fontWeight: 800, flex: 1 }}
                                    >
                                        {category}
                                    </Typography>
                                    <Box sx={{
                                        px: 0.9, py: 0.05, borderRadius: 5, fontSize: '0.66rem', fontWeight: 700,
                                        color: gFrom, bgcolor: `${gFrom}16`,
                                    }}>
                                        {items.length}
                                    </Box>
                                    <Icon
                                        sx={{
                                            fontSize: 18, color: 'text.disabled',
                                            transition: 'transform .2s cubic-bezier(0.4,0,0.2,1)',
                                            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
                                        }}
                                    >
                                        expand_more
                                    </Icon>
                                </Box>
                                <Collapse in={open} timeout="auto" unmountOnExit>
                                    <Grid container spacing={1.25} sx={{ pb: 1 }}>
                                        {items.map(item => (
                                            <DraggableItem key={item.type} item={item} colors={meta.grad} onAdd={onAdd} query={search} />
                                        ))}
                                    </Grid>
                                </Collapse>
                            </Box>
                        );
                    })}
                    {!anyMatch && (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 6, px: 2 }}>
                            <Icon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }}>search_off</Icon>
                            <Typography variant="body2">No components match “{search}”.</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    const renderDocsList = () => (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List component="nav" sx={{ p: 0 }}>
                {Object.entries(CATEGORIES).map(([category, types]) => {
                    const meta = CATEGORY_META[category] || { color: '#6366f1', icon: 'category' };
                    return (
                        <Box key={category}>
                            <Box sx={{ px: 2, py: 1.25, bgcolor: '#f8f9fc', display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: meta.color }} />
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                                    {category}
                                </Typography>
                            </Box>
                            {types.map(type => {
                                const item = TOOLBOX_ITEMS.find(t => t.type === type);
                                if (!item) return null;
                                return (
                                    <ListItemButton
                                        key={type}
                                        onClick={() => setSelectedDoc(type)}
                                        sx={{
                                            borderBottom: '1px solid',
                                            borderColor: 'rgba(15,23,42,0.04)',
                                            transition: 'all 0.15s',
                                            '&:hover': { bgcolor: `${meta.color}0d`, pl: 2.5 },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 34, color: meta.color }}>
                                            <Icon fontSize="small">{item.icon}</Icon>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            slotProps={{
                                                primary: { sx: { fontSize: '0.875rem', fontWeight: 500 } },
                                            }}
                                        />
                                        <Icon fontSize="small" sx={{ color: 'text.disabled', fontSize: 16 }}>chevron_right</Icon>
                                    </ListItemButton>
                                );
                            })}
                        </Box>
                    );
                })}
            </List>
        </Box>
    );

    const renderDocDetail = () => {
        if (!selectedDoc) return null;
        const item = TOOLBOX_ITEMS.find(t => t.type === selectedDoc);
        const doc = COMPONENT_DOCS[selectedDoc];

        return (
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8f9fc' }}>
                    <Button
                        startIcon={<Icon>arrow_back</Icon>}
                        onClick={() => setSelectedDoc(null)}
                        size="small"
                        sx={{ minWidth: 'auto', px: 1 }}
                    />
                    <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99,102,241,0.12)', color: 'primary.main' }}>
                        <Icon fontSize="small">{item?.icon || 'widgets'}</Icon>
                    </Box>
                    <Typography variant="subtitle1" sx={{
                        fontWeight: 700
                    }}>
                        {item?.label || selectedDoc}
                    </Typography>
                </Box>

                {doc ? (
                    <Box sx={{ p: 3 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                                marginBottom: "16px"
                            }}>
                            {doc.description}
                        </Typography>

                        <Box sx={{ mb: 3 }}>
                            <Typography
                                variant="caption"
                                color="primary"
                                sx={{
                                    fontWeight: 700,
                                    display: 'block',
                                    mb: 1,
                                    letterSpacing: '0.5px'
                                }}>
                                USAGE
                            </Typography>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                                    "{doc.usage}"
                                </Typography>
                            </Paper>
                        </Box>

                        <Typography
                            variant="caption"
                            color="primary"
                            sx={{
                                fontWeight: 700,
                                display: 'block',
                                mb: 1,
                                letterSpacing: '0.5px'
                            }}>
                            PROPERTIES
                        </Typography>
                        <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f8f9fc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Prop</TableCell>
                                        <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Description</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(doc.props).map(([prop, desc]) => (
                                        <TableRow key={prop} sx={{ '&:last-child td': { border: 0 } }}>
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
                    <Tab label="Builder" icon={<Icon fontSize="small">build</Icon>} iconPosition="start" sx={{ minHeight: 60, textTransform: 'none', fontWeight: 600 }} />
                    <Tab label="Docs" icon={<Icon fontSize="small">article</Icon>} iconPosition="start" sx={{ minHeight: 60, textTransform: 'none', fontWeight: 600 }} />
                </Tabs>
            </Box>

            {tab === 0 ? renderBuilder() : (selectedDoc ? renderDocDetail() : renderDocsList())}
        </Paper>
    );
};
