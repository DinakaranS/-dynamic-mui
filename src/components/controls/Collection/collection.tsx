// eslint-disable-next-line import/no-cycle
import { useRef, useState } from 'react';
import type { CollectionConfig, ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { collectionIssues, toItems } from '../../../util/collection';
import { CollectionNode, nextKey, toNodes, toValue } from './tree';
// eslint-disable-next-line import/no-cycle
import CollectionList from './CollectionList';

const MANDATORY_RULES = ['mandatory', 'mandatoryselect'];

const stringify = (v: any): string => {
    try { return JSON.stringify(v); } catch { return ''; }
};

/**
 * `collection` — a nested, dialog-edited list. Each item is added/edited in a
 * modal form and shown as a card; items can own nested collections (e.g.
 * Customer Locations → Services + Backflow devices) to any depth.
 *
 * Value: `[{ ...fields, [child.id]: [{ ...childFields, ... }] }]`.
 */
export default function Collection({ attributes = {}, rules = {}, onChange, submitTick }: ControlProps) {
    const { id = '', value } = attributes;
    const config = { ...(attributes as CollectionConfig), id, fields: attributes.fields || [] };
    const readOnly = !!(attributes.readOnly || attributes.disabled || attributes.MuiAttributes?.disabled);
    const mandatory = rules?.validation?.find((v: any) => MANDATORY_RULES.includes(v.rule));

    const [instance] = useState(nextKey);
    const [nodes, setNodes] = useState<CollectionNode[]>(() => toNodes(value, config));
    // Errors stay hidden until the first submit attempt, then track live.
    const [showErrors, setShowErrors] = useState(false);
    // The last value we emitted. The parent feeds it straight back as
    // `attributes.value`; only a DIFFERENT incoming value (a patch / setValues)
    // rebuilds the tree, so item identity and expand state survive edits.
    const lastEmitted = useRef(stringify(toItems(value)));

    useUpdateEffect(() => {
        const incoming = stringify(toItems(value));
        if (incoming === lastEmitted.current) return;
        lastEmitted.current = incoming;
        setNodes(toNodes(value, config));
    }, [value]);

    useUpdateEffect(() => {
        if (submitTick) setShowErrors(true);
    }, [submitTick]);

    const commit = (next: CollectionNode[]) => {
        setNodes(next);
        const out = toValue(next, config);
        lastEmitted.current = stringify(out);
        onChange?.({ id, value: out });
    };

    const issues = collectionIssues(toValue(nodes, config), config, {
        required: !!mandatory,
        requiredMessage: mandatory?.message,
    });

    return (
        <CollectionList
            config={config}
            nodes={nodes}
            onChange={commit}
            guid={`${instance}-${id}`}
            readOnly={readOnly}
            issues={issues}
            showErrors={showErrors}
            required={!!mandatory}
        />
    );
}
