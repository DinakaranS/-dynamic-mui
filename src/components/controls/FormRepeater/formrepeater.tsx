// eslint-disable-next-line import/no-cycle
import { useState, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    InputAdornment,
} from '@mui/material';
import { Icon } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { ControlProps } from '../../../types';
// eslint-disable-next-line import/no-cycle
import { FormGenerator, FormData } from '../../FormGenerator';
import { FormField } from '../../../util/helper';

export default function FormRepeater({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        label = 'Group',
        min = 1,
        max,
        subFields = [] as FormField[],
        value: patchValue,
    } = attributes;

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    /** Initial count: from patch array length, or from attributes.count prop, or min */
    const initialCount = useMemo(() => {
        if (Array.isArray(patchValue) && patchValue.length > 0) return patchValue.length;
        const attrCount = Number(attributes.count);
        return !isNaN(attrCount) && attrCount >= min ? attrCount : min;
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [count, setCount] = useState<number>(initialCount);

    /**
     * One stable guid per group index, allocated lazily and grown on demand so
     * the count can exceed any pre-sized ceiling without collisions. Previously a
     * fixed ceiling of 20 meant every group beyond it shared the guid
     * `${id}-group-undefined`, colliding their FormData stores and React keys.
     */
    const guidsRef = useRef<string[]>([]);
    const guidFor = useCallback((i: number) => {
        if (!guidsRef.current[i]) guidsRef.current[i] = uuidv4();
        return guidsRef.current[i];
    }, []);

    /** Notify parent with the current values from all groups */
    const emitChange = useCallback((currentCount: number) => {
        if (!onChange) return;
        const value = Array.from({ length: currentCount }, (_, i) => {
            const groupGuid = `${id}-group-${guidFor(i)}`;
            return FormData(groupGuid) ?? {};
        });
        onChange({ id, value });
    }, [id, guidFor, onChange]);

    const handleCountChange = (raw: string) => {
        let next = parseInt(raw, 10);
        if (isNaN(next) || next < min) next = min;
        if (max !== undefined && next > max) next = max;
        setCount(next);
        // Emit on next tick so new FormGenerators are mounted
        setTimeout(() => emitChange(next), 0);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* ── Count input ─────────────────────────────────── */}
            <TextField
                type="number"
                size="small"
                label={`Number of ${label}s`}
                value={count}
                onChange={(e) => handleCountChange(e.target.value)}
                required={isMandatory}
                sx={{ mb: 2, minWidth: 200 }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <Icon fontSize="small">format_list_numbered</Icon>
                            </InputAdornment>
                        ),
                    },

                    htmlInput: { min, ...(max !== undefined ? { max } : {}) }
                }} />

            {/* ── Dynamic groups ──────────────────────────────── */}
            {Array.from({ length: count }, (_, i) => {
                const groupGuid = `${id}-group-${guidFor(i)}`;
                const groupPatch = Array.isArray(patchValue) ? patchValue[i] : undefined;

                return (
                    <Accordion key={groupGuid} defaultExpanded={i === 0} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                            <Typography sx={{
                                fontWeight: 600
                            }}>
                                {label} {i + 1}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormGenerator
                                guid={groupGuid}
                                data={subFields}
                                patch={groupPatch ?? {}}
                                onChange={(args) => {
                                    // Bubble up the full array value on any inner field change
                                    emitChange(count);
                                    // Also forward individual field change if needed
                                    if (onChange) onChange(args);
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
}
