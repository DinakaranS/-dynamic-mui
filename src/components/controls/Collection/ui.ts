import merge from 'lodash/merge';
import type { SxProps, Theme } from '@mui/material/styles';
import type {
    CollectionActions,
    CollectionAddButton,
    CollectionColumns,
    CollectionConfig,
    CollectionSlot,
    CollectionTexts,
} from '../../../types';
import { itemLabelOf, titleOf } from '../../../util/collection';

/**
 * Resolves one collection level's JSON into everything its UI needs: accent
 * colours, wording, behaviour defaults, and `sx(slot, base)` — the built-in
 * style of a part with the JSON `styles[slot]` override layered on top. Every
 * visual and textual detail therefore comes from (or can be replaced by) JSON.
 */

export type Accent = { main: string; light: string; dark: string; contrastText: string };

/** Palette colour by name, or any CSS colour expanded into light/dark shades. */
export const accentOf = (theme: Theme, color?: string): Accent => {
    const named = (theme.palette as any)[color || 'primary'];
    if (named && typeof named === 'object' && named.main) return named as Accent;
    try {
        return theme.palette.augmentColor({ color: { main: String(color) } }) as unknown as Accent;
    } catch {
        return theme.palette.primary as unknown as Accent;
    }
};

/** Readable accent text on a tinted background, in light and dark mode. */
export const inkOf = (theme: Theme, accent: Accent) => (theme.palette.mode === 'dark' ? accent.light : accent.dark);

export const DEFAULT_TEXTS: Required<Omit<CollectionTexts, 'emptyText'>> & { emptyText?: string } = {
    add: 'Add {label}',
    addMore: 'Add another {labelLower}',
    emptyTitle: 'No {pluralLower} yet',
    emptyText: undefined,
    edit: 'Edit',
    duplicate: 'Duplicate',
    moveUp: 'Move up',
    moveDown: 'Move down',
    delete: 'Delete',
    more: 'More actions',
    collapse: 'Collapse',
    expand: 'Expand',
    editAria: 'Edit {title}',
    deleteAria: 'Delete {title}',
    viewAria: 'View {title}',
    moreAria: 'More actions for {title}',
    collapseAria: 'Collapse {title}',
    expandAria: 'Expand {title}',
    maxReached: 'Maximum of {max} reached',
    dialogAddTitle: 'Add {label}',
    dialogEditTitle: 'Edit {label}',
    dialogViewTitle: '{label}',
    dialogContext: 'For {parent}',
    save: 'Add {label}',
    saveChanges: 'Save changes',
    saveAndAddAnother: 'Save & add another',
    cancel: 'Cancel',
    close: 'Close',
    closeAria: 'Close dialog',
    shortcut: '⌘/Ctrl + Enter',
    deleteTitle: 'Delete {labelLower}?',
    deleteMessage: '{title} will be removed{detail}. This can’t be undone.',
    deleteDetail: ', along with {detail}',
    deleteConfirm: 'Delete',
};

/** Fill `{name}` placeholders; unknown ones are left as-is. */
export const fmt = (template: string, vars: Record<string, string | number | undefined>): string =>
    template.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] != null ? String(vars[k]) : m));

/** MUI `sx` for a responsive grid with `columns` (or auto-fill at `minWidth`). */
export const gridColumns = (columns: CollectionColumns | undefined, minWidth: number) => {
    if (columns == null) return `repeat(auto-fill, minmax(min(${minWidth}px, 100%), 1fr))`;
    const one = (n: number) => `repeat(${Math.max(1, n)}, minmax(0, 1fr))`;
    if (typeof columns === 'number') return one(columns);
    return Object.fromEntries(Object.entries(columns).map(([bp, n]) => [bp, one(Number(n))]));
};

const asArray = (sx: any): any[] => (sx == null ? [] : Array.isArray(sx) ? sx : [sx]);

export interface CollectionUi {
    config: CollectionConfig;
    depth: number;
    nested: boolean;
    accent: Accent;
    ink: string;
    icon: string;
    itemLabel: string;
    plural: string;
    texts: CollectionTexts;
    layout: 'cards' | 'table';
    variant: 'card' | 'outlined' | 'flat';
    addButton: Required<Omit<CollectionAddButton, 'size' | 'fullWidth'>> & Pick<CollectionAddButton, 'size' | 'fullWidth'>;
    actions: Required<CollectionActions>;
    /** Text for `key` with this level's placeholders (+ `vars`) filled in. */
    t: (key: keyof CollectionTexts, vars?: Record<string, string | number | undefined>) => string;
    /** Built-in style for `slot` with the JSON override merged on top. */
    sx: (slot: CollectionSlot, base?: SxProps<Theme>) => SxProps<Theme>;
    /** Same as `sx`, deep-merged into ONE object (for nested selectors, which can't take arrays). */
    merged: (slot: CollectionSlot, base?: Record<string, any>) => Record<string, any>;
}

export const resolveUi = (
    theme: Theme,
    config: CollectionConfig,
    depth: number,
    inheritedTexts: CollectionTexts = {},
): CollectionUi => {
    const nested = depth > 0;
    const accent = accentOf(theme, config.color);
    const itemLabel = itemLabelOf(config);
    const plural = titleOf(config);
    const texts: CollectionTexts = { ...DEFAULT_TEXTS, ...inheritedTexts, ...(config.texts || {}) };
    const styles = config.styles || {};
    const vars = {
        label: itemLabel,
        labelLower: itemLabel.toLowerCase(),
        plural,
        pluralLower: plural.toLowerCase(),
        max: config.max,
    };

    return {
        config,
        depth,
        nested,
        accent,
        ink: inkOf(theme, accent),
        icon: config.icon || (nested ? 'label' : 'folder_open'),
        itemLabel,
        plural,
        texts,
        layout: config.layout || (nested ? 'table' : 'cards'),
        variant: config.variant || 'outlined',
        addButton: {
            position: 'header',
            variant: nested ? 'outlined' : 'contained',
            icon: 'add',
            ...(config.addButton || {}),
        },
        // Simple by default: edit + delete. Duplicate / move / collapse are opt-in.
        actions: { edit: true, delete: true, duplicate: false, move: false, collapse: false, ...(config.actions || {}) },
        t: (key, extra = {}) => fmt(String(texts[key] ?? ''), { ...vars, ...extra }),
        sx: (slot, base) => [...asArray(base), ...asArray(styles[slot])] as SxProps<Theme>,
        merged: (slot, base = {}) => merge({}, base, styles[slot] || {}),
    };
};
