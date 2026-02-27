import { useState, useEffect } from 'react';
import { TextField, Button, Box, IconButton, Stack } from '@mui/material';
import { Icon } from '@mui/material';
import { ControlProps } from '../../../types';
import useUpdateEffect from '../../../util/useUpdateEffect';

export default function MultiTextbox({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { id = '' } = attributes;

    // Internal state to track list of values
    const [items, setItems] = useState<{ key: string; value: string }[]>(() => {
        if (attributes.value && typeof attributes.value === 'object') {
            const initialItems = Object.entries(attributes.value).map(([key, val]) => ({
                key,
                value: String(val)
            }));
            if (initialItems.length > 0) return initialItems;
        }
        return [{ key: 't1', value: '' }];
    });

    const isMandatory = rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    useUpdateEffect(() => {
        if (attributes.value && typeof attributes.value === 'object') {
            const newItems = Object.entries(attributes.value).map(([key, val]) => ({
                key,
                value: String(val)
            }));

            // Only update if fundamentally different to avoid infinite loops
            if (JSON.stringify(newItems) !== JSON.stringify(items)) {
                setItems(newItems.length > 0 ? newItems : [{ key: 't1', value: '' }]);
            }
        } else if (!attributes.value) {
            // default clear state
            setItems([{ key: 't1', value: '' }]);
        }
    }, [attributes.value]);

    // Update parent whenever items change
    useEffect(() => {
        // Transform [{key: 't1', value: 'v1'}] -> { t1: 'v1' }
        const result = items.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {} as Record<string, string>);

        if (onChange) {
            onChange({ id, value: result });
        }
    }, [items, id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdd = () => {
        const nextIndex = items.length + 1;
        setItems([...items, { key: `t${nextIndex}`, value: '' }]);
    };

    const handleRemove = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index].value = val;
        setItems(newItems);
    };

    return (
        <Stack spacing={2} sx={{ width: '100%' }}>
            {items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        required={isMandatory}
                        error={isMandatory && !item.value}
                        helperText={isMandatory && !item.value ? 'Required' : ''}
                        label={`Value ${item.key}`}
                        value={item.value}
                        onChange={(e) => handleChange(index, e.target.value)}
                        size="small"
                    />
                    {index === items.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAdd}
                            sx={{ minWidth: '40px', p: 1 }}
                        >
                            <Icon>add</Icon>
                        </Button>
                    ) : (
                        <IconButton
                            color="error"
                            onClick={() => handleRemove(index)}
                        >
                            <Icon>remove</Icon>
                        </IconButton>
                    )}
                </Box>
            ))}
        </Stack>
    );
}
