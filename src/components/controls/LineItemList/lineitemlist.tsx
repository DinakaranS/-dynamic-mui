import { useState, useEffect } from 'react';
import { TextField, Button, Box, IconButton, Stack, InputAdornment, Typography } from '@mui/material';
import { Icon } from '@mui/material';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

/** Represents a single row in the LineItemList control. */
interface LineItem {
    /** The full dynamic key, e.g. "miscellaneous1", "charge1", "item1" */
    key: string;
    description: string;
    fee: number;
}

/**
 * Sub-attribute overrides per inner element.
 * Each key maps to the full MUI props of that element.
 */
interface LineItemMuiAttributes {
    /** Props spread into the row container <Box> */
    row?: Record<string, any>;
    /** Props spread into the row-number badge <Typography> */
    rowBadge?: Record<string, any>;
    /** Props spread into the Description <TextField> */
    description?: Record<string, any>;
    /** Props spread into the Fee <TextField> */
    fee?: Record<string, any>;
    /** Props spread into the Add <Button> */
    addButton?: Record<string, any>;
    /** Props spread into the Remove <IconButton> */
    removeButton?: Record<string, any>;
}

/**
 * Derives the key prefix from an array of patch entries.
 * e.g. [{ fee: 0, miscellaneous1: "x" }] → "miscellaneous"
 * Falls back to the provided defaultPrefix if no patch, or "item" if none given.
 */
function extractKeyPrefix(value: any, defaultPrefix: string): string {
    if (Array.isArray(value) && value.length > 0) {
        const firstEntry = value[0];
        const descKey = Object.keys(firstEntry).find((k) => k !== 'fee');
        if (descKey) {
            // Strip trailing digits: "miscellaneous1" → "miscellaneous"
            return descKey.replace(/\d+$/, '');
        }
    }
    return defaultPrefix;
}

/**
 * Parses the incoming patch value into internal LineItem[].
 * Patch format: Array of { fee: number, [prefix+index]: string }
 */
function parsePatchValue(value: any, keyPrefix: string): LineItem[] {
    if (Array.isArray(value) && value.length > 0) {
        return value.map((entry: Record<string, any>, idx: number) => {
            const { fee = 0, ...rest } = entry;
            const descKey = Object.keys(rest)[0] || `${keyPrefix}${idx + 1}`;
            return {
                key: descKey,
                description: String(rest[descKey] ?? ''),
                fee: Number(fee) || 0,
            };
        });
    }
    return [{ key: `${keyPrefix}1`, description: '', fee: 0 }];
}

/**
 * Serializes internal LineItem[] back to the patch/output array format.
 * Output: [{ fee: 0, [dynamicKey]: "..." }, ...]
 */
function serializeItems(items: LineItem[]): Record<string, any>[] {
    return items.map((item) => ({
        fee: item.fee,
        [item.key]: item.description,
    }));
}

export default function LineItemList({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const {
        id = '',
        keyPrefix: propKeyPrefix = 'item',
        /** Set to false to hide the row number badge. Defaults to true. */
        showRowBadge = true,
        MuiAttributes = {} as LineItemMuiAttributes,
    } = attributes;

    const {
        row: rowProps = {},
        rowBadge: rowBadgeProps = {},
        description: descriptionProps = {},
        fee: feeProps = {},
        addButton: addButtonProps = {},
        removeButton: removeButtonProps = {},
    } = MuiAttributes;

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    // Resolve the key prefix: from patch data first, then prop, then default
    const keyPrefix = extractKeyPrefix(attributes.value, propKeyPrefix);

    const [items, setItems] = useState<LineItem[]>(() => parsePatchValue(attributes.value, keyPrefix));

    // Sync when patch value changes externally
    useUpdateEffect(() => {
        const resolvedPrefix = extractKeyPrefix(attributes.value, propKeyPrefix);
        const parsed = parsePatchValue(attributes.value, resolvedPrefix);
        if (JSON.stringify(parsed) !== JSON.stringify(items)) {
            setItems(parsed);
        }
    }, [attributes.value]);

    // Notify parent on every change
    useEffect(() => {
        if (onChange) {
            onChange({ id, value: serializeItems(items) });
        }
    }, [items, id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdd = () => {
        const nextIndex = items.length + 1;
        setItems([...items, { key: `${keyPrefix}${nextIndex}`, description: '', fee: 0 }]);
    };

    const handleRemove = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        // Re-index keys sequentially so the numbering stays clean
        const reKeyed = newItems.map((item, i) => ({ ...item, key: `${keyPrefix}${i + 1}` }));
        setItems(reKeyed);
    };

    const handleDescriptionChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], description: val };
        setItems(newItems);
    };

    const handleFeeChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], fee: Number(val) || 0 };
        setItems(newItems);
    };

    return (
        <Stack spacing={1.5} sx={{ width: '100%' }}>
            {items.map((item, index) => (
                <Box
                    key={item.key}
                    sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        backgroundColor: 'background.paper',
                    }}
                    {...rowProps}
                >
                    {/* Row number badge — toggled via showRowBadge */}
                    {showRowBadge && (
                        <Typography
                            variant="caption"
                            sx={{
                                minWidth: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                flexShrink: 0,
                                mt: 0.75,
                            }}
                            {...rowBadgeProps}
                        >
                            {index + 1}
                        </Typography>
                    )}

                    {/* Description textbox */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Description"
                        required={isMandatory}
                        error={isMandatory && !item.description}
                        helperText={isMandatory && !item.description ? 'Required' : ''}
                        value={item.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        {...descriptionProps}
                    />

                    {/* Fee amount textbox */}
                    <TextField
                        size="small"
                        label="Fee"
                        type="number"
                        sx={{ minWidth: 120 }}
                        required={isMandatory}
                        value={item.fee}
                        onChange={(e) => handleFeeChange(index, e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                        {...feeProps}
                    />

                    {/* Add / Remove buttons */}
                    {index === items.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAdd}
                            sx={{ minWidth: 40, px: 1, height: 40, flexShrink: 0 }}
                            title="Add row"
                            {...addButtonProps}
                        >
                            <Icon>add</Icon>
                        </Button>
                    ) : (
                        <IconButton
                            color="error"
                            onClick={() => handleRemove(index)}
                            sx={{ height: 40, flexShrink: 0 }}
                            title="Remove row"
                            {...removeButtonProps}
                        >
                            <Icon>delete</Icon>
                        </IconButton>
                    )}
                </Box>
            ))}
        </Stack>
    );
}
