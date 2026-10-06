// eslint-disable-next-line import/no-cycle
import { Fragment, useState, type ReactNode } from 'react';
import {
    Box,
    Button,
    ButtonBase,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    Icon,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { CollectionColor, CollectionConfig, CollectionTexts } from '../../../types';
import {
    CollectionIssue,
    describeDescendants,
    describeItem,
    detailSpecs,
    fieldLabel,
    findField,
    formatValue,
    itemLabelOf,
    pluralize,
} from '../../../util/collection';
import { CollectionNode, cloneNode, emptyChildren, nextKey } from './tree';
import { CollectionUi, gridColumns, resolveUi } from './ui';
import { AddButton, CountPill, EASE, EmptyState, ItemAvatar, StatusBadge } from './parts';
// eslint-disable-next-line import/no-cycle
import ItemDialog, { ItemDialogMode } from './ItemDialog';

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                              */
/* -------------------------------------------------------------------------- */

function SectionHeader({ ui, count, required, action, alone = false }: { ui: CollectionUi; count: number; required: boolean; action?: ReactNode; alone?: boolean }) {
    const { nested } = ui;
    return (
        <Box sx={ui.sx('header', { display: 'flex', alignItems: 'center', gap: 1.5, mb: alone ? 0 : nested ? 1.25 : 2.5, flexWrap: 'wrap' })}>
            <Box sx={{ flex: 1, minWidth: nested ? 140 : { xs: '100%', sm: 220 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: nested ? 0.75 : 1 }}>
                    {ui.config.icon && (
                        /* Same pill-badge for both nested and top-level — just smaller for nested */
                        <Box sx={{
                            width: nested ? 26 : 32,
                            height: nested ? 26 : 32,
                            borderRadius: nested ? '6px' : '8px',
                            bgcolor: alpha(ui.accent.main, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}>
                            <Icon sx={ui.sx('headerIcon', {
                                color: ui.ink,
                                fontSize: `${nested ? 14 : 18}px !important`,
                            })}>
                                {ui.icon}
                            </Icon>
                        </Box>
                    )}
                    <Typography sx={ui.sx('headerTitle', {
                        fontWeight: 700,
                        fontSize: nested ? 14 : 19,
                        lineHeight: 1.3,
                        color: 'text.primary',
                    })}>
                        {ui.plural}
                        {required && <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box>}
                    </Typography>
                    <CountPill ui={ui} n={count} />
                </Box>
                {ui.config.description && (
                    <Typography sx={ui.sx('headerDescription', {
                        fontSize: 13.5,
                        color: 'text.secondary',
                        mt: 0.5,
                        ml: nested ? 0 : (ui.config.icon ? '44px' : 0),
                    })}>
                        {ui.config.description}
                    </Typography>
                )}
            </Box>
            {action}
        </Box>
    );
}


/** Clickable item title — opens the item (edit, or view when read-only). */
function ItemTitle({ ui, title, canEdit, onOpen, size }: { ui: CollectionUi; title: string; canEdit: boolean; onOpen: () => void; size: number }) {
    return (
        <ButtonBase
            onClick={onOpen}
            // Named by its text when editable (the edit button is "Edit …").
            aria-label={canEdit ? undefined : ui.t('viewAria', { title })}
            aria-haspopup="dialog"
            sx={ui.sx('itemTitle', {
                borderRadius: '4px',
                textAlign: 'left',
                justifyContent: 'flex-start',
                fontFamily: 'inherit',
                fontWeight: 600,
                fontSize: size,
                lineHeight: 1.4,
                color: 'text.primary',
                wordBreak: 'break-word',
                '&:hover': { color: ui.ink, textDecoration: 'underline' },
                '&.Mui-focusVisible': { outline: `2px solid ${alpha(ui.accent.main, 0.5)}`, outlineOffset: 2 },
            })}
        >
            {title}
        </ButtonBase>
    );
}

function Badge({ ui, data }: { ui: CollectionUi; data: Record<string, any> }) {
    const display = ui.config.display || {};
    const spec = typeof display.badge === 'string' ? { field: display.badge } : display.badge;
    if (!spec) return null;
    const raw = data[spec.field];
    const text = formatValue(findField(ui.config.fields || [], spec.field), raw);
    if (!text) return null;
    const color = (spec.colors?.[String(raw)] ?? spec.colors?.[text] ?? 'default') as CollectionColor | 'default';
    return <StatusBadge ui={ui} text={text} color={color} />;
}

interface ActionsProps {
    ui: CollectionUi;
    title: string;
    readOnly: boolean;
    open?: boolean;
    canToggle?: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onMenu: (anchor: HTMLElement) => void;
    onToggle?: () => void;
}

/** Edit / Delete as plain buttons (icons in tables), plus an optional menu
/** Edit / Delete / More / Toggle — always icon-only circular buttons. */
function ItemActions({ ui, title, readOnly, open, canToggle, onEdit, onDelete, onMenu, onToggle }: ActionsProps) {
    const theme = useTheme();
    const canEdit = !readOnly && ui.actions.edit;
    const canDelete = !readOnly && ui.actions.delete;
    const hasMenu = !readOnly && (ui.actions.duplicate || ui.actions.move);

    // Ghost icon button — colored icon, no permanent bg, rounded square hover
    const btn = (color: string, hoverBg: string) => ({
        width: 30,
        height: 30,
        borderRadius: '8px',
        color,
        transition: `background-color .15s ${EASE}, color .15s ${EASE}`,
        '&:hover': { bgcolor: hoverBg },
    });

    return (
        <Box sx={ui.sx('actions', { display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 })}>
            {canEdit && (
                <Tooltip title={ui.t('edit')}>
                    <IconButton size="small" aria-label={ui.t('editAria', { title })} onClick={onEdit}
                        sx={ui.sx('actionButton', btn(ui.ink, alpha(ui.accent.main, 0.1)))}>
                        <Icon sx={{ fontSize: '17px !important' }}>edit</Icon>
                    </IconButton>
                </Tooltip>
            )}
            {canDelete && (
                <Tooltip title={ui.t('delete')}>
                    <IconButton size="small" aria-label={ui.t('deleteAria', { title })} onClick={onDelete}
                        sx={ui.sx('actionButton', btn(theme.palette.error.main, alpha(theme.palette.error.main, 0.08)))}>
                        <Icon sx={{ fontSize: '17px !important' }}>delete_outline</Icon>
                    </IconButton>
                </Tooltip>
            )}
            {hasMenu && (
                <Tooltip title={ui.t('more')}>
                    <IconButton size="small" aria-label={ui.t('moreAria', { title })} onClick={(e) => onMenu(e.currentTarget)}
                        sx={ui.sx('actionButton', btn(theme.palette.text.secondary, alpha(theme.palette.text.primary, 0.07)))}>
                        <Icon sx={{ fontSize: '17px !important' }}>more_vert</Icon>
                    </IconButton>
                </Tooltip>
            )}
            {canToggle && (
                <Tooltip title={open ? ui.t('collapse') : ui.t('expand')}>
                    <IconButton size="small" aria-label={ui.t(open ? 'collapseAria' : 'expandAria', { title })}
                        aria-expanded={open} onClick={onToggle}
                        sx={ui.sx('actionButton', btn(theme.palette.text.secondary, alpha(theme.palette.text.primary, 0.07)))}>
                        <Icon sx={{ fontSize: '19px !important', transition: `transform .2s ${EASE}`, transform: open ? 'rotate(180deg)' : 'none' }}>
                            expand_more
                        </Icon>
                    </IconButton>
                </Tooltip>
            )}
        </Box>
    );
}


interface NestedProps {
    ui: CollectionUi;
    node: CollectionNode;
    guid: string;
    readOnly: boolean;
    issues: CollectionIssue[];
    showErrors: boolean;
    texts: CollectionTexts;
    parentTitle: string;
    onChildChange: (childId: string, next: CollectionNode[]) => void;
}

/** An item's nested collections, one section per row (`sectionColumns`). */
function NestedSections({ ui, node, guid, readOnly, issues, showErrors, texts, parentTitle, onChildChange }: NestedProps) {
    const theme = useTheme();
    const childConfigs = ui.config.collections || [];
    return (
        <Box sx={ui.sx('sections', { display: 'grid', gridTemplateColumns: gridColumns(ui.config.sectionColumns ?? 1, 320) })}>
            {childConfigs.map((child, ci) => (
                <Box
                    key={child.id}
                    sx={ui.sx('section', {
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.common.white, 0.02)
                            : alpha(theme.palette.grey[500], 0.03),
                        minWidth: 0,
                        // If there are multiple columns, add left border to separate them
                        ...(ci > 0 ? { borderLeft: `1px solid ${theme.palette.divider}` } : {}),
                    })}
                >
                    <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 1.5, sm: 1.75 }, pb: { xs: 1.25, sm: 1.5 } }}>
                        <CollectionList
                            config={child}
                            nodes={node.children[child.id] || []}
                            onChange={(next) => onChildChange(child.id, next)}
                            guid={`${guid}-${node.key}`}
                            depth={ui.depth + 1}
                            readOnly={readOnly}
                            issues={issues
                                .filter((is) => is.path[0] === child.id)
                                .map((is) => ({ ...is, path: is.path.slice(1) }))}
                            showErrors={showErrors}
                            parentTitle={parentTitle}
                            texts={texts}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}


/* -------------------------------------------------------------------------- */
/* Cards layout                                                               */
/* -------------------------------------------------------------------------- */

interface ItemProps {
    ui: CollectionUi;
    node: CollectionNode;
    index: number;
    guid: string;
    readOnly: boolean;
    collapsed: boolean;
    issues: CollectionIssue[];
    showErrors: boolean;
    texts: CollectionTexts;
    onOpen: () => void;
    onDelete: () => void;
    onMenu: (anchor: HTMLElement) => void;
    onToggle: () => void;
    onChildChange: (childId: string, next: CollectionNode[]) => void;
}

function CardItem({ ui, node, index, guid, readOnly, collapsed, issues, showErrors, texts, onOpen, onDelete, onMenu, onToggle, onChildChange }: ItemProps) {
    const theme = useTheme();
    const { config } = ui;
    const display = config.display || {};
    const { title, subtitle, details } = describeItem(node.data, config, index);
    const childConfigs = config.collections || [];
    const hasChildren = childConfigs.length > 0;
    const hasError = showErrors && issues.length > 0;
    const avatar = display.avatar || 'none';
    const canEdit = !readOnly && ui.actions.edit;
    const canDelete = !readOnly && ui.actions.delete;
    const hasMenu = !readOnly && (ui.actions.duplicate || ui.actions.move);

    // Card can be collapsed whenever it has content (details bar OR nested sections)
    const canCollapse = details.length > 0 || hasChildren;
    const open = !collapsed; // collapsed prop is managed by parent; default is false (open)

    const accentBg = hasError
        ? alpha(theme.palette.error.main, 0.05)
        : alpha(ui.accent.main, 0.05);
    const accentBorder = hasError
        ? alpha(theme.palette.error.main, 0.2)
        : alpha(ui.accent.main, 0.15);

    // Same ghost icon style as ItemActions — colored icon, no bg, rounded square hover
    const btn = (color: string, hoverBg: string) => ({
        width: 30,
        height: 30,
        borderRadius: '8px',
        color,
        transition: `background-color .15s ${EASE}`,
        '&:hover': { bgcolor: hoverBg },
    });

    return (
        <Box sx={ui.sx('item', {
            border: `1px solid ${hasError ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: '14px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.06)}, 0 4px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        })}>

            {/* ── Colored header ─────────────────────────────────────────────── */}
            <Box sx={ui.sx('itemHeader', {
                px: { xs: 2, sm: 2.5 },
                pt: { xs: 1.75, sm: 2 },
                pb: { xs: 1.5, sm: 1.75 },
                bgcolor: accentBg,
                borderBottom: open && canCollapse
                    ? `1px solid ${accentBorder}`
                    : '1px solid transparent',
                transition: `border-color .2s ${EASE}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
            })}>
                {avatar !== 'none' && <ItemAvatar ui={ui} mode={avatar} title={title} index={index} />}

                {/* Title + badge + subtitle */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: subtitle ? 0.25 : 0 }}>
                        <ItemTitle ui={ui} title={title} canEdit={canEdit} onOpen={onOpen} size={15.5} />
                        <Badge ui={ui} data={node.data} />
                    </Box>
                    {subtitle && (
                        <Typography sx={ui.sx('subtitle', {
                            display: 'flex', alignItems: 'center', gap: 0.4,
                            fontSize: 13, color: 'text.secondary', wordBreak: 'break-word',
                            '& .MuiIcon-root': { fontSize: 14, color: 'text.disabled' },
                        })}>
                            {display.subtitleIcon && <Icon>{display.subtitleIcon}</Icon>}
                            {subtitle}
                        </Typography>
                    )}
                    {/* Child count pills shown when collapsed */}
                    {!open && hasChildren && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.6 }}>
                            {childConfigs.map((c) => {
                                const n = (node.children[c.id] || []).length;
                                return (
                                    <Box key={c.id} component="span" sx={{
                                        fontSize: 12, fontWeight: 600, px: 1, py: 0.2,
                                        borderRadius: '999px',
                                        bgcolor: alpha(ui.accent.main, 0.08),
                                        color: ui.ink,
                                        border: `1px solid ${alpha(ui.accent.main, 0.18)}`,
                                    }}>
                                        {n} {pluralize(itemLabelOf(c), n).toLowerCase()}
                                    </Box>
                                );
                            })}
                        </Box>
                    )}
                </Box>

                {/* ── Action buttons — identical style to table rows ─────────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 0.25, mt: -0.25 }}>
                    {canEdit && (
                        <Tooltip title={ui.t('edit')}>
                            <IconButton size="small" aria-label={ui.t('editAria', { title })} onClick={onOpen}
                                sx={btn(ui.ink, alpha(ui.accent.main, 0.1))}>
                                <Icon sx={{ fontSize: '17px !important' }}>edit</Icon>
                            </IconButton>
                        </Tooltip>
                    )}
                    {canDelete && (
                        <Tooltip title={ui.t('delete')}>
                            <IconButton size="small" aria-label={ui.t('deleteAria', { title })} onClick={onDelete}
                                sx={btn(theme.palette.error.main, alpha(theme.palette.error.main, 0.08))}>
                                <Icon sx={{ fontSize: '17px !important' }}>delete_outline</Icon>
                            </IconButton>
                        </Tooltip>
                    )}
                    {hasMenu && (
                        <Tooltip title={ui.t('more')}>
                            <IconButton size="small" aria-label={ui.t('moreAria', { title })} onClick={(e) => onMenu(e.currentTarget)}
                                sx={btn(theme.palette.text.secondary, alpha(theme.palette.text.primary, 0.07))}>
                                <Icon sx={{ fontSize: '17px !important' }}>more_vert</Icon>
                            </IconButton>
                        </Tooltip>
                    )}
                    {canCollapse && (
                        <Tooltip title={open ? ui.t('collapse') : ui.t('expand')}>
                            <IconButton size="small" aria-label={ui.t(open ? 'collapseAria' : 'expandAria', { title })} onClick={onToggle}
                                sx={btn(theme.palette.text.secondary, alpha(theme.palette.text.primary, 0.07))}>
                                <Icon sx={{
                                    fontSize: '19px !important',
                                    transition: `transform .25s ${EASE}`,
                                    transform: open ? 'rotate(180deg)' : 'none',
                                }}>expand_more</Icon>
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>


            {/* ── Collapsible body: details bar + nested sections ────────────── */}
            {canCollapse && (
                <Collapse in={open} timeout={220}>
                    {/* Horizontal details bar */}
                    {details.length > 0 && (
                        <Box sx={ui.sx('details', {
                            display: 'flex',
                            overflowX: 'auto',
                            borderBottom: hasChildren ? `1px solid ${theme.palette.divider}` : 'none',
                            '&::-webkit-scrollbar': { height: 0 },
                        })}>
                            {details.map((d, i) => (
                                <Box
                                    key={d.id}
                                    sx={ui.sx('detail', {
                                        flex: '1 1 0',
                                        minWidth: 90,
                                        maxWidth: 220,
                                        px: { xs: 2, sm: 2.5 },
                                        py: 1.5,
                                        borderLeft: i > 0 ? `1px solid ${theme.palette.divider}` : 'none',
                                    })}
                                >
                                    <Typography sx={ui.sx('detailLabel', {
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        letterSpacing: '0.07em',
                                        textTransform: 'uppercase',
                                        color: 'text.disabled',
                                        mb: 0.25,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.4,
                                        whiteSpace: 'nowrap',
                                    })}>
                                        {d.icon && <Icon sx={{ fontSize: '11px !important' }}>{d.icon}</Icon>}
                                        {d.label}
                                    </Typography>
                                    <Typography sx={ui.sx('detailValue', {
                                        fontSize: 13.5,
                                        fontWeight: 600,
                                        color: d.value ? 'text.primary' : 'text.disabled',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.4,
                                    })}>
                                        {d.value || '—'}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Nested collections */}
                    {hasChildren && (
                        <NestedSections
                            ui={ui}
                            node={node}
                            guid={guid}
                            readOnly={readOnly}
                            issues={issues}
                            showErrors={showErrors}
                            texts={texts}
                            parentTitle={title}
                            onChildChange={onChildChange}
                        />
                    )}
                </Collapse>
            )}
        </Box>
    );
}




/* -------------------------------------------------------------------------- */
/* Table layout                                                               */
/* -------------------------------------------------------------------------- */

interface TableProps {
    ui: CollectionUi;
    nodes: CollectionNode[];
    guid: string;
    readOnly: boolean;
    issues: CollectionIssue[];
    showErrors: boolean;
    texts: CollectionTexts;
    isCollapsed: (key: string) => boolean;
    onToggle: (key: string) => void;
    onOpen: (index: number) => void;
    onDelete: (index: number) => void;
    onMenu: (anchor: HTMLElement, index: number) => void;
    onChildChange: (index: number, childId: string, next: CollectionNode[]) => void;
}

/** One row per item, one column per detail; stacked rows on phones. */
function TableItems({ ui, nodes, guid, readOnly, issues, showErrors, texts, isCollapsed, onToggle, onOpen, onDelete, onMenu, onChildChange }: TableProps) {
    const theme = useTheme();
    const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
    const { config } = ui;
    const fields = config.fields || [];
    const display = config.display || {};
    const columns = detailSpecs(config);
    const badgeField = typeof display.badge === 'string' ? display.badge : display.badge?.field;
    const badgeLabel = (typeof display.badge === 'object' && display.badge?.label) || (badgeField ? fieldLabel(findField(fields, badgeField)) || badgeField : '');
    const hasChildren = (config.collections || []).length > 0;
    const canEdit = !readOnly && ui.actions.edit;
    const showActions = !readOnly && (ui.actions.edit || ui.actions.delete || ui.actions.duplicate || ui.actions.move);
    const itemIssues = (i: number) => issues.filter((is) => is.path[0] === i).map((is) => ({ ...is, path: is.path.slice(1) }));
    const empty = <Box component="span" sx={{ color: 'text.disabled' }}>—</Box>;

    const nested = (node: CollectionNode, index: number, title: string) => hasChildren && (
        <Collapse in={!isCollapsed(node.key)} timeout={200} unmountOnExit>
            <NestedSections
                ui={ui}
                node={node}
                guid={guid}
                readOnly={readOnly}
                issues={itemIssues(index)}
                showErrors={showErrors}
                texts={texts}
                parentTitle={title}
                onChildChange={(childId, next) => onChildChange(index, childId, next)}
            />
        </Collapse>
    );
    const actions = (node: CollectionNode, index: number, title: string) => (
        <ItemActions
            ui={ui}
            title={title}
            readOnly={readOnly}
            open={!isCollapsed(node.key)}
            canToggle={hasChildren}
            onEdit={() => onOpen(index)}
            onDelete={() => onDelete(index)}
            onMenu={(anchor) => onMenu(anchor, index)}
            onToggle={() => onToggle(node.key)}
        />
    );
    const errorBg = alpha(theme.palette.error.main, 0.06);

    if (isPhone) {
        return (
            <Box sx={ui.sx('table', { border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper' })}>
                {nodes.map((node, index) => {
                    const { title, details } = describeItem(node.data, config, index);
                    const hasError = showErrors && itemIssues(index).length > 0;
                    return (
                        <Box key={node.key} sx={ui.sx('mobileRow', { borderTop: index ? `1px solid ${theme.palette.divider}` : 'none', ...(hasError ? { bgcolor: errorBg } : {}) })}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 1.5 }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                        <ItemTitle ui={ui} title={title} canEdit={canEdit} onOpen={() => onOpen(index)} size={14.5} />
                                        <Badge ui={ui} data={node.data} />
                                    </Box>
                                    {details.length > 0 && (
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.25, mt: 0.75 }}>
                                            {details.map((d) => (
                                                <Fragment key={d.id}>
                                                    <Typography sx={ui.sx('detailLabel', { fontSize: 13, color: 'text.secondary' })}>{d.label}</Typography>
                                                    <Typography sx={ui.sx('detailValue', { fontSize: 13, fontWeight: 500, wordBreak: 'break-word' })}>{d.value}</Typography>
                                                </Fragment>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                                {(showActions || hasChildren) && actions(node, index, title)}
                            </Box>
                            {nested(node, index, title)}
                        </Box>
                    );
                })}
            </Box>
        );
    }

    const head = ui.sx('tableHeadCell', { fontSize: 12.5, fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap', py: 1, px: 1.75 });
    const cell = ui.sx('tableCell', { fontSize: 14, color: 'text.primary', whiteSpace: 'nowrap', py: 1.1, px: 1.75 });
    const colCount = 1 + columns.length + (badgeField ? 1 : 0) + (showActions || hasChildren ? 1 : 0);

    return (
        <Box sx={ui.sx('table', { border: `1px solid ${theme.palette.divider}`, borderRadius: '8px', overflowX: 'auto', bgcolor: 'background.paper' })}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={ui.sx('tableHead', { bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.05 : 0.03) })}>
                        <TableCell sx={head}>{display.titleLabel || ui.itemLabel}</TableCell>
                        {columns.map((c) => <TableCell key={c.id} sx={head}>{c.label}</TableCell>)}
                        {badgeField && <TableCell sx={head}>{badgeLabel}</TableCell>}
                        {(showActions || hasChildren) && <TableCell sx={head} />}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {nodes.map((node, index) => {
                        const { title, rawTitle } = describeItem(node.data, config, index);
                        const hasError = showErrors && itemIssues(index).length > 0;
                        const last = index === nodes.length - 1;
                        const noLine = last && !(hasChildren && !isCollapsed(node.key)) ? { '& > td': { borderBottom: 0 } } : {};
                        return (
                            <Fragment key={node.key}>
                                <TableRow hover sx={ui.sx('tableRow', { ...noLine, ...(hasError ? { bgcolor: errorBg } : {}) })}>
                                    <TableCell sx={cell}>
                                        {/* The raw title: this column is headed by a field's own
                                            label, so a row number here reads as a value. Still
                                            clickable when blank — the placeholder is the target,
                                            exactly as in the columns beside it. */}
                                        {rawTitle ? (
                                            <ItemTitle ui={ui} title={rawTitle} canEdit={canEdit} onOpen={() => onOpen(index)} size={14} />
                                        ) : (
                                            <Box
                                                component={canEdit ? 'button' : 'span'}
                                                type={canEdit ? 'button' : undefined}
                                                onClick={canEdit ? () => onOpen(index) : undefined}
                                                aria-label={canEdit ? ui.t('editAria', { title }) : undefined}
                                                sx={{
                                                    background: 'none',
                                                    border: 0,
                                                    p: 0,
                                                    font: 'inherit',
                                                    color: 'text.disabled',
                                                    cursor: canEdit ? 'pointer' : 'default',
                                                }}
                                            >
                                                —
                                            </Box>
                                        )}
                                    </TableCell>
                                    {columns.map((c) => (
                                        <TableCell key={c.id} sx={cell}>
                                            {formatValue(findField(fields, c.id), node.data[c.id]) || empty}
                                        </TableCell>
                                    ))}
                                    {badgeField && <TableCell sx={cell}><Badge ui={ui} data={node.data} /></TableCell>}
                                    {(showActions || hasChildren) && (
                                        <TableCell align="right" sx={ui.sx('rowActions', { width: '1%', whiteSpace: 'nowrap', py: 0.25 })}>
                                            <Box sx={{ display: 'inline-flex' }}>{actions(node, index, title)}</Box>
                                        </TableCell>
                                    )}
                                </TableRow>
                                {hasChildren && !isCollapsed(node.key) && (
                                    <TableRow>
                                        <TableCell colSpan={colCount} sx={{ p: 0, ...(last ? { borderBottom: 0 } : {}) }}>
                                            {nested(node, index, title)}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

/* -------------------------------------------------------------------------- */
/* One level of the tree                                                      */
/* -------------------------------------------------------------------------- */

export interface CollectionListProps {
    config: CollectionConfig;
    nodes: CollectionNode[];
    onChange: (next: CollectionNode[]) => void;
    /** Unique prefix for this level's dialog form store. */
    guid: string;
    depth?: number;
    readOnly?: boolean;
    /** Issues for this list, with paths relative to it. */
    issues?: CollectionIssue[];
    showErrors?: boolean;
    /** Mark the heading as required. */
    required?: boolean;
    /** Title of the owning item, shown as context in the dialog. */
    parentTitle?: string;
    /** Texts inherited from the parent level. */
    texts?: CollectionTexts;
}

type DialogState = { open: boolean; mode: ItemDialogMode; index: number; session: number };
type DeleteState = { open: boolean; index: number; title: string; detail: string };

export default function CollectionList({
    config,
    nodes,
    onChange,
    guid,
    depth = 0,
    readOnly = false,
    issues = [],
    showErrors = false,
    required = false,
    parentTitle,
    texts: inheritedTexts,
}: CollectionListProps) {
    const theme = useTheme();
    const ui = resolveUi(theme, config, depth, inheritedTexts);
    // Wording is inherited by nested levels, except the empty-state copy, which describes this level.
    const { emptyTitle: _emptyTitle, emptyText: _emptyText, ...childTexts } = { ...(inheritedTexts || {}), ...(config.texts || {}) };
    const max = config.max != null ? Number(config.max) : undefined;
    const canAdd = !readOnly && (max === undefined || nodes.length < max);
    const position = readOnly ? 'none' : ui.addButton.position;
    const inHeader = position === 'header' || position === 'both';
    const inFooter = position === 'footer' || position === 'both';
    // Empty nested sections show nothing but their header (JSON: `showEmpty`).
    const showEmpty = config.showEmpty ?? !ui.nested;
    const showEmptyState = nodes.length === 0 && showEmpty && !(inFooter && ui.addButton.variant === 'dashed');
    const headerAlone = nodes.length === 0 && !showEmptyState && !inFooter;

    const [dialog, setDialog] = useState<DialogState>({ open: false, mode: 'add', index: -1, session: 0 });
    const [del, setDel] = useState<DeleteState>({ open: false, index: -1, title: '', detail: '' });
    const [menu, setMenu] = useState<{ anchor: HTMLElement; index: number } | null>(null);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const openDialog = (mode: ItemDialogMode, index = -1) =>
        setDialog((d) => ({ open: true, mode, index, session: d.session + 1 }));
    const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
    const add = () => openDialog('add');
    const open = (index: number) => openDialog(!readOnly && ui.actions.edit ? 'edit' : 'view', index);

    // Table rows with nested lists start collapsed; cards start open.
    const defaultCollapsed = config.defaultCollapsed ?? ui.layout === 'table';
    const isCollapsed = (key: string) => collapsed[key] ?? defaultCollapsed;
    const toggle = (key: string) => setCollapsed((c) => ({ ...c, [key]: !isCollapsed(key) }));

    const handleSave = (values: Record<string, any>, keepOpen: boolean) => {
        if (dialog.mode === 'add') {
            const node: CollectionNode = { key: nextKey(), data: values, children: emptyChildren(config) };
            if (ui.layout === 'cards') setCollapsed((c) => ({ ...c, [node.key]: false }));
            onChange([...nodes, node]);
            const full = max !== undefined && nodes.length + 1 >= max;
            if (!keepOpen || full) closeDialog();
            return;
        }
        if (dialog.mode === 'edit') {
            onChange(nodes.map((n, i) => (i === dialog.index ? { ...n, data: values } : n)));
        }
        closeDialog();
    };

    const remove = (index: number) => onChange(nodes.filter((_, i) => i !== index));

    const requestDelete = (index: number) => {
        if (config.confirmDelete === false) { remove(index); return; }
        const node = nodes[index];
        setDel({
            open: true,
            index,
            title: describeItem(node.data, config, index).title,
            detail: describeDescendants({ ...node.data, ...node.children }, config),
        });
    };

    const duplicate = (index: number) => {
        const next = [...nodes];
        next.splice(index + 1, 0, cloneNode(nodes[index]));
        onChange(next);
    };

    const move = (index: number, dir: -1 | 1) => {
        const j = index + dir;
        if (j < 0 || j >= nodes.length) return;
        const next = [...nodes];
        [next[index], next[j]] = [next[j], next[index]];
        onChange(next);
    };

    const setChild = (index: number, childId: string, list: CollectionNode[]) =>
        onChange(nodes.map((n, i) => (i === index ? { ...n, children: { ...n.children, [childId]: list } } : n)));

    const levelError = showErrors ? issues.find((is) => is.path.length === 0)?.message : undefined;
    const editing = dialog.index >= 0 ? nodes[dialog.index] : undefined;
    const menuIndex = menu?.index ?? -1;
    const runMenu = (fn: () => void) => { setMenu(null); fn(); };

    /** Set every card to collapsed (true) or expanded (false). */
    const collapseAll = () => setCollapsed(Object.fromEntries(nodes.map((n) => [n.key, true])));
    const expandAll   = () => setCollapsed(Object.fromEntries(nodes.map((n) => [n.key, false])));

    /** True when every card is currently collapsed — button switches to "Expand all". */
    const allCollapsed = nodes.length > 0 && nodes.every((n) => isCollapsed(n.key));

    // "{title} will be removed…" with the title emphasised.
    const deleteMessage = ui.t('deleteMessage', { detail: del.detail ? ui.t('deleteDetail', { detail: del.detail }) : '' });
    const [msgBefore, msgAfter] = deleteMessage.includes('{title}') ? deleteMessage.split('{title}') : [deleteMessage, null];

    return (
        <Box data-collection={config.id} sx={ui.sx('root', { width: '100%', minWidth: 0 })}>
            <SectionHeader
                ui={ui}
                count={nodes.length}
                required={required || (Number(config.min) || 0) > 0}
                alone={headerAlone && !levelError}
                action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {/* Single smart toggle — "Collapse all" when any open, "Expand all" when all closed */}
                        {ui.layout === 'cards' && nodes.length >= 2 && (
                            <Button
                                size="small"
                                variant="text"
                                onClick={allCollapsed ? expandAll : collapseAll}
                                sx={{
                                    fontSize: 12.5,
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                    px: 1,
                                    minWidth: 0,
                                    textTransform: 'none',
                                    '&:hover': { color: 'text.primary', bgcolor: alpha(theme.palette.text.primary, 0.05) },
                                }}
                                startIcon={
                                    <Icon sx={{ fontSize: '15px !important' }}>
                                        {allCollapsed ? 'unfold_more' : 'unfold_less'}
                                    </Icon>
                                }
                            >
                                {allCollapsed ? 'Expand all' : 'Collapse all'}
                            </Button>
                        )}
                        {inHeader && <AddButton ui={ui} placement="header" empty={nodes.length === 0} disabled={!canAdd} onClick={add} />}
                    </Box>
                }
            />

            {levelError && (
                <Typography
                    role="alert"
                    sx={ui.sx('error', { display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', fontSize: 13, fontWeight: 500, mt: -0.5, mb: 1.25 })}
                >
                    <Icon sx={{ fontSize: '17px !important' }}>error_outline</Icon>
                    {levelError}
                </Typography>
            )}

            {showEmptyState && (
                <EmptyState ui={ui} readOnly={readOnly} error={!!levelError} />
            )}

            {nodes.length > 0 && ui.layout === 'table' && (
                <TableItems
                    ui={ui}
                    nodes={nodes}
                    guid={guid}
                    readOnly={readOnly}
                    issues={issues}
                    showErrors={showErrors}
                    texts={childTexts}
                    isCollapsed={isCollapsed}
                    onToggle={toggle}
                    onOpen={open}
                    onDelete={requestDelete}
                    onMenu={(anchor, index) => setMenu({ anchor, index })}
                    onChildChange={setChild}
                />
            )}

            {nodes.length > 0 && ui.layout === 'cards' && (
                <Box sx={ui.sx('list', { display: 'flex', flexDirection: 'column', gap: 2 })}>
                    {nodes.map((node, index) => (
                        <CardItem
                            key={node.key}
                            ui={ui}
                            node={node}
                            index={index}
                            guid={guid}
                            readOnly={readOnly}
                            collapsed={isCollapsed(node.key)}
                            issues={issues
                                .filter((is) => is.path[0] === index)
                                .map((is) => ({ ...is, path: is.path.slice(1) }))}
                            showErrors={showErrors}
                            texts={childTexts}
                            onOpen={() => open(index)}
                            onDelete={() => requestDelete(index)}
                            onMenu={(anchor) => setMenu({ anchor, index })}
                            onToggle={() => toggle(node.key)}
                            onChildChange={(childId, next) => setChild(index, childId, next)}
                        />
                    ))}
                </Box>
            )}

            {inFooter && (
                <Box sx={{ mt: nodes.length || ui.addButton.variant !== 'dashed' ? 1.25 : 0 }}>
                    <AddButton ui={ui} placement="footer" empty={nodes.length === 0} disabled={!canAdd} onClick={add} />
                </Box>
            )}

            <ItemDialog
                ui={ui}
                open={dialog.open}
                mode={dialog.mode}
                session={dialog.session}
                guid={`${guid}-${config.id}`}
                initial={editing?.data}
                context={parentTitle}
                onClose={closeDialog}
                onSave={handleSave}
            />

            <Menu
                anchorEl={menu?.anchor}
                open={!!menu}
                onClose={() => setMenu(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ '& .MuiPaper-root': ui.merged('menu', { borderRadius: '10px', minWidth: 170 }) }}
            >
                {ui.actions.duplicate && (
                    <MenuItem sx={ui.sx('menuItem')} disabled={!canAdd} onClick={() => runMenu(() => duplicate(menuIndex))}>
                        <ListItemIcon><Icon fontSize="small">content_copy</Icon></ListItemIcon>
                        <ListItemText>{ui.t('duplicate')}</ListItemText>
                    </MenuItem>
                )}
                {ui.actions.move && (
                    <MenuItem sx={ui.sx('menuItem')} disabled={menuIndex <= 0} onClick={() => runMenu(() => move(menuIndex, -1))}>
                        <ListItemIcon><Icon fontSize="small">arrow_upward</Icon></ListItemIcon>
                        <ListItemText>{ui.t('moveUp')}</ListItemText>
                    </MenuItem>
                )}
                {ui.actions.move && (
                    <MenuItem sx={ui.sx('menuItem')} disabled={menuIndex >= nodes.length - 1} onClick={() => runMenu(() => move(menuIndex, 1))}>
                        <ListItemIcon><Icon fontSize="small">arrow_downward</Icon></ListItemIcon>
                        <ListItemText>{ui.t('moveDown')}</ListItemText>
                    </MenuItem>
                )}
            </Menu>

            <Dialog
                open={del.open}
                onClose={() => setDel((d) => ({ ...d, open: false }))}
                maxWidth="xs"
                fullWidth
                sx={{ '& .MuiDialog-paper': ui.merged('confirm', { borderRadius: '12px', backgroundImage: 'none' }) }}
            >
                <DialogContent sx={{ pt: 3, pb: 1 }}>
                    <Typography sx={ui.sx('confirmTitle', { fontWeight: 600, fontSize: 17 })}>
                        {ui.t('deleteTitle')}
                    </Typography>
                    <Typography sx={ui.sx('confirmText', { fontSize: 14, color: 'text.secondary', mt: 1 })}>
                        {msgBefore}
                        {msgAfter !== null && <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>{del.title}</Box>}
                        {msgAfter}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1, '& .MuiButton-root': { textTransform: 'none', fontWeight: 600, borderRadius: '8px' } }}>
                    <Button color="inherit" onClick={() => setDel((d) => ({ ...d, open: false }))} sx={ui.sx('confirmCancel', { color: 'text.secondary' })}>
                        {ui.t('cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        disableElevation
                        onClick={() => { remove(del.index); setDel((d) => ({ ...d, open: false })); }}
                        sx={ui.sx('confirmDelete')}
                    >
                        {ui.t('deleteConfirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
