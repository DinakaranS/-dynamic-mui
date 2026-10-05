import type { ReactNode } from 'react';
import { Box, Button, ButtonBase, Icon, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { CollectionColor } from '../../../types';
import { ItemDetail, itemLabelOf, pluralize } from '../../../util/collection';
import { CollectionUi, accentOf, gridColumns, inkOf } from './ui';

/* Small building blocks of the collection UI. Each takes its look from
   `ui.sx(slot, base)`, so JSON `styles` can restyle any of them. The defaults
   are deliberately quiet: neutral text, thin borders, colour only on actions. */

export const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

export function CountPill({ ui, n }: { ui: CollectionUi; n: number }) {
    const theme = useTheme();
    return (
        <Box
            component="span"
            sx={ui.sx('headerCount', {
                minWidth: 22,
                height: 20,
                px: 0.75,
                borderRadius: '999px',
                display: 'inline-grid',
                placeItems: 'center',
                fontSize: 11.5,
                fontWeight: 700,
                bgcolor: n > 0
                    ? alpha(ui.accent.main, 0.12)
                    : alpha(theme.palette.text.primary, 0.07),
                color: n > 0 ? ui.ink : 'text.secondary',
                border: `1px solid ${n > 0 ? alpha(ui.accent.main, 0.2) : 'transparent'}`,
            })}
        >
            {n}
        </Box>
    );
}


const initialsOf = (text: string) =>
    text
        .split(/\s+/)
        .map((w) => w.match(/[A-Za-z0-9]/)?.[0] || '')
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase() || '#';

/** Optional leading avatar on cards (`display.avatar`; none by default). */
export function ItemAvatar({ ui, mode, title, index }: { ui: CollectionUi; mode: string; title: string; index: number }) {
    if (mode === 'none') return null;
    return (
        <Box sx={ui.sx('avatar', {
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: '10px',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 600,
            fontSize: 14,
            bgcolor: alpha(ui.accent.main, 0.1),
            color: ui.ink,
            '& .MuiIcon-root': { fontSize: 20 },
        })}>
            {mode === 'initials' ? initialsOf(title) : mode === 'index' ? index + 1 : <Icon>{ui.icon}</Icon>}
        </Box>
    );
}

export function StatusBadge({ ui, text, color }: { ui: CollectionUi; text: string; color: CollectionColor | 'default' }) {
    const theme = useTheme();
    const accent = color === 'default' ? null : accentOf(theme, color);
    return (
        <Box
            component="span"
            sx={ui.sx('badge', {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.3,
                borderRadius: '999px',
                fontSize: 11.5,
                fontWeight: 700,
                lineHeight: 1.6,
                whiteSpace: 'nowrap',
                letterSpacing: '0.02em',
                bgcolor: accent ? alpha(accent.main, 0.1) : alpha(theme.palette.text.primary, 0.06),
                color: accent ? inkOf(theme, accent) : 'text.secondary',
                border: `1px solid ${accent ? alpha(accent.main, 0.25) : alpha(theme.palette.text.primary, 0.12)}`,
                '&::before': {
                    content: '""',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: accent ? accent.main : 'text.disabled',
                    flexShrink: 0,
                },
            })}
        >
            {text}
        </Box>
    );
}

/** An item's facts: a small icon in front of the label, the value underneath. */
export function Details({ ui, details }: { ui: CollectionUi; details: ItemDetail[] }) {
    const theme = useTheme();
    const display = ui.config.display || {};
    const layout = display.detailsLayout || 'grid';
    const showIcons = display.showIcons !== false;

    const labelEl = (d: ItemDetail, extra = {}) => (
        <Typography
            component="div"
            sx={ui.sx('detailLabel', {
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'text.disabled',
                lineHeight: 1.4,
                mb: 0.4,
                ...extra,
            })}
        >
            {showIcons && (
                <Icon sx={ui.sx('detailIcon', { fontSize: '13px !important', color: 'text.disabled' })}>{d.icon}</Icon>
            )}
            {d.label}
        </Typography>
    );
    const valueEl = (d: ItemDetail, extra = {}) => (
        <Typography sx={ui.sx('detailValue', { fontSize: 13.5, fontWeight: 600, color: 'text.primary', lineHeight: 1.4, wordBreak: 'break-word', ...extra })}>
            {d.value}
        </Typography>
    );

    if (layout === 'list') {
        return (
            <Box sx={ui.sx('details', { display: 'flex', flexDirection: 'column', gap: 0.5 })}>
                {details.map((d, i) => (
                    <Box
                        key={d.id}
                        sx={ui.sx('detail', {
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 2,
                            py: 0.9,
                            borderTop: i ? `1px solid ${theme.palette.divider}` : 'none',
                        })}
                    >
                        {labelEl(d, { flex: '0 0 36%', minWidth: 0, mb: 0 })}
                        {valueEl(d, { flex: 1, minWidth: 0 })}
                    </Box>
                ))}
            </Box>
        );
    }

    if (layout === 'inline') {
        return (
            <Box sx={ui.sx('details', { display: 'flex', flexWrap: 'wrap', columnGap: 3, rowGap: 1 })}>
                {details.map((d) => (
                    <Box key={d.id} sx={ui.sx('detail', { display: 'inline-flex', alignItems: 'baseline', gap: 0.75, minWidth: 0 })}>
                        {labelEl(d, { '&::after': { content: '":"' }, mb: 0 })}
                        {valueEl(d)}
                    </Box>
                ))}
            </Box>
        );
    }

    // Default: grid — each cell is a subtle chip with label above value
    return (
        <Box
            sx={ui.sx('details', {
                display: 'grid',
                gridTemplateColumns: gridColumns(display.columns, display.minColumnWidth ?? 140),
                gap: 1,
            })}
        >
            {details.map((d) => (
                <Box
                    key={d.id}
                    sx={ui.sx('detail', {
                        minWidth: 0,
                        px: 1.5,
                        py: 1,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.04 : 0.03),
                        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                        ...(d.span ? { gridColumn: { xs: 'auto', sm: `span ${d.span}` } } : {}),
                    })}
                >
                    {labelEl(d)}
                    {valueEl(d)}
                </Box>
            ))}
        </Box>
    );
}


/** The add action of a level ("+ Add Service"). */
export function AddButton({ ui, placement, empty, disabled, onClick }: {
    ui: CollectionUi; placement: 'header' | 'footer'; empty: boolean; disabled: boolean; onClick: () => void;
}) {
    const { variant, icon, size, fullWidth } = ui.addButton;
    const label = placement === 'footer' && !empty ? ui.t('addMore') : ui.t('add');
    const atMax = ui.config.max != null && disabled;
    const block = !!fullWidth || (variant === 'dashed' && fullWidth !== false);
    const wrap = (node: ReactNode) => (
        <Tooltip title={atMax ? ui.t('maxReached') : ''}>
            <Box component="span" sx={{ display: block ? 'block' : 'inline-flex', flexShrink: 0 }}>{node}</Box>
        </Tooltip>
    );

    if (variant === 'dashed') {
        return wrap(
            <ButtonBase
                onClick={onClick}
                disabled={disabled}
                sx={ui.sx('addButton', {
                    width: block ? '100%' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    py: 1.1,
                    px: 2,
                    borderRadius: '8px',
                    border: `1px dashed ${alpha(ui.accent.main, 0.5)}`,
                    color: ui.ink,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 600,
                    transition: `background-color .15s ${EASE}`,
                    '&:hover': { bgcolor: alpha(ui.accent.main, 0.06) },
                    '&.Mui-focusVisible': { outline: `2px solid ${alpha(ui.accent.main, 0.5)}`, outlineOffset: 2 },
                    '&.Mui-disabled': { opacity: 0.5 },
                    '& .MuiIcon-root': { fontSize: 19 },
                })}
            >
                <Icon>{icon}</Icon>
                {label}
            </ButtonBase>,
        );
    }

    const look = {
        contained: { bgcolor: ui.accent.main, color: ui.accent.contrastText, '&:hover': { bgcolor: ui.accent.dark } },
        outlined: { color: ui.ink, borderColor: alpha(ui.accent.main, 0.5), '&:hover': { borderColor: ui.accent.main, bgcolor: alpha(ui.accent.main, 0.05) } },
        text: { color: ui.ink, '&:hover': { bgcolor: alpha(ui.accent.main, 0.07) } },
        soft: { color: ui.ink, bgcolor: alpha(ui.accent.main, 0.1), '&:hover': { bgcolor: alpha(ui.accent.main, 0.16) } },
    }[variant] || {};

    return wrap(
        <Button
            onClick={onClick}
            disabled={disabled}
            variant={variant === 'soft' ? 'text' : variant}
            color="inherit"
            size={size || (ui.nested ? 'small' : 'medium')}
            fullWidth={fullWidth}
            disableElevation
            startIcon={<Icon>{icon}</Icon>}
            sx={ui.sx('addButton', {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: ui.nested ? 1.5 : 2,
                whiteSpace: 'nowrap',
                ...look,
            })}
        >
            {label}
        </Button>,
    );
}

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
const listJoin = (parts: string[]) =>
    (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`);

/** One-line hint for an empty top level ("Add a customer location, then add
 *  its services and backflows."). Nested levels just say they're empty. */
const defaultEmptyText = (ui: CollectionUi): string => {
    if (ui.nested) return '';
    const label = ui.itemLabel.toLowerCase();
    const children = (ui.config.collections || []).map((c) => pluralize(itemLabelOf(c)).toLowerCase());
    return children.length
        ? `Add ${article(label)} ${label}, then add its ${listJoin(children)}.`
        : `Add your first ${label} to get started.`;
};

/** Shown when a level has no items yet. The add button stays the one action. */
export function EmptyState({ ui, readOnly, error }: { ui: CollectionUi; readOnly: boolean; error: boolean }) {
    const theme = useTheme();
    const text = ui.texts.emptyText != null ? ui.t('emptyText') : defaultEmptyText(ui);

    if (ui.nested) {
        // Ultra-compact: just one line of muted italic text, no border, no box, no wasted space
        return (
            <Typography sx={ui.sx('empty', {
                fontSize: 13,
                color: 'text.disabled',
                fontStyle: 'italic',
                py: 0.75,
                px: 0,
                display: 'block',
            })}>
                {ui.t('emptyTitle')}
            </Typography>
        );
    }

    return (
        <Box
            sx={ui.sx('empty', {
                py: 5,
                px: 3,
                textAlign: 'center',
                borderRadius: '10px',
                border: `1.5px dashed ${error ? theme.palette.error.main : alpha(theme.palette.text.primary, 0.15)}`,
                bgcolor: error
                    ? alpha(theme.palette.error.main, 0.03)
                    : alpha(theme.palette.text.primary, 0.02),
            })}
        >
            <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: alpha(ui.accent.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
            }}>
                <Icon sx={{ color: ui.ink, fontSize: '22px !important' }}>{ui.icon || 'inbox'}</Icon>
            </Box>
            <Typography sx={ui.sx('emptyTitle', { fontSize: 15, fontWeight: 600, color: 'text.primary' })}>
                {ui.t('emptyTitle')}
            </Typography>
            {text && !readOnly && (
                <Typography sx={ui.sx('emptyText', { fontSize: 13.5, color: 'text.secondary', mt: 0.5, maxWidth: 380, mx: 'auto' })}>
                    {text}
                </Typography>
            )}
        </Box>
    );
}

