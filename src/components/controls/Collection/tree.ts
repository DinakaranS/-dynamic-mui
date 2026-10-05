import cloneDeep from 'lodash/cloneDeep';
import type { CollectionConfig } from '../../../types';
import { toItems } from '../../../util/collection';

/**
 * Internal representation of a collection value. Each item carries a stable
 * `key` (React identity across edits, moves and duplicates) and keeps its own
 * field values apart from its nested lists. The consumer only ever sees the
 * plain JSON produced by `toValue`.
 */
export interface CollectionNode {
    key: string;
    data: Record<string, any>;
    children: Record<string, CollectionNode[]>;
}

let seq = 0;
export const nextKey = (): string => `dmui-col-${++seq}`;

const childIds = (config: Partial<CollectionConfig>) => (config.collections || []).map((c) => c.id);

export const emptyChildren = (config: Partial<CollectionConfig>): Record<string, CollectionNode[]> =>
    Object.fromEntries(childIds(config).map((id) => [id, []]));

export const toNodes = (value: any, config: Partial<CollectionConfig>): CollectionNode[] =>
    toItems(value).map((item) => {
        const ids = new Set(childIds(config));
        const data = Object.fromEntries(Object.entries(item).filter(([k]) => !ids.has(k)));
        const children = Object.fromEntries(
            (config.collections || []).map((c) => [c.id, toNodes(item[c.id], c)]),
        );
        return { key: nextKey(), data, children };
    });

export const toValue = (nodes: CollectionNode[], config: Partial<CollectionConfig>): Record<string, any>[] =>
    nodes.map((n) => {
        const out: Record<string, any> = { ...n.data };
        (config.collections || []).forEach((c) => {
            out[c.id] = toValue(n.children[c.id] || [], c);
        });
        return out;
    });

/** Deep copy with fresh keys at every level (for "Duplicate"). */
export const cloneNode = (node: CollectionNode): CollectionNode => ({
    key: nextKey(),
    data: cloneDeep(node.data),
    children: Object.fromEntries(Object.entries(node.children).map(([id, list]) => [id, list.map(cloneNode)])),
});
