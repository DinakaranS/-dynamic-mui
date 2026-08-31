import { Paper, Typography, Box, TextField, Button, Divider, Icon, Switch, FormControlLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FormField } from '../util/helper';
import { useState, useEffect } from 'react';
import { get, set, cloneDeep } from 'lodash';
import { AITextAssist } from '../ai';
import { useAI } from './AIContext';

// Shared panel styling tokens for a cohesive, premium look
const PANEL_SX = {
    width: 350,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderLeft: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
} as const;

const HEADER_SX = {
    p: 2,
    background: 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
    borderBottom: '1px solid',
    borderColor: 'divider',
} as const;

const ACTION_BAR_SX = {
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    background: 'linear-gradient(0deg, #f8f9fc 0%, #ffffff 100%)',
} as const;

interface PropertiesEditorProps {
    field: FormField | null;
    onUpdate: (field: FormField) => void;
    onDelete: (id: string) => void;
    allFields?: FormField[];
    onAllFieldsChange?: (fields: FormField[]) => void;
}

// Helper to determine the path for a given property based on component type
const getPropertyPath = (type: string, property: string): string => {
    switch (property) {
        case 'label':
            if (['switch', 'checkbox'].includes(type)) return 'props.MuiFCLAttributes.label';
            if (['radio'].includes(type)) return 'props.MuiFLabel';
            if (['group', 'accordion', 'chip', 'autocomplete'].includes(type)) return 'props.label';
            if (['button', 'typography'].includes(type)) return 'props.text';
            return 'props.MuiAttributes.label'; // Default for textfield, select, etc.
        case 'placeholder':
            return 'props.MuiAttributes.placeholder';
        case 'helperText':
            return 'props.MuiAttributes.helperText';
        default:
            return '';
    }
};

export const PropertiesEditor = ({ field, onUpdate, onDelete, allFields = [], onAllFieldsChange }: PropertiesEditorProps) => {
    const { client } = useAI();
    const [mode, setMode] = useState<'individual' | 'form'>('individual');
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [jsonValue, setJsonValue] = useState('');
    const [formJsonValue, setFormJsonValue] = useState('');

    useEffect(() => {
        if (mode === 'individual') {
            if (field) {
                setJsonValue(JSON.stringify(field, null, 2));
                setJsonError(null);
            } else {
                setJsonValue('');
            }
        }
    }, [field, mode]);

    useEffect(() => {
        if (mode === 'form' && allFields) {
            setFormJsonValue(JSON.stringify(allFields, null, 2));
            setJsonError(null);
        }
    }, [allFields, mode]);

    const handleModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'individual' | 'form' | null) => {
        if (newMode !== null) {
            setMode(newMode);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setJsonValue(newVal);
        try {
            JSON.parse(newVal);
            setJsonError(null);
        } catch (err) {
            setJsonError('Invalid JSON');
        }
    };

    const handleFormJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setFormJsonValue(newVal);
        try {
            const parsed = JSON.parse(newVal);
            if (!Array.isArray(parsed)) throw new Error('Root must be an array');
            setJsonError(null);
        } catch (err) {
            setJsonError('Invalid JSON Array');
        }
    };

    const handleQuickUpdate = (property: string, value: any) => {
        try {
            const currentObj = JSON.parse(jsonValue);
            const newObj = cloneDeep(currentObj); // Deep clone to be safe

            if (property === 'required') {
                const rules = newObj.rules || {};
                const validation = rules.validation || [];
                const hasRequired = validation.some((v: any) => v.rule === 'mandatory');

                if (value && !hasRequired) {
                    newObj.rules = { ...rules, validation: [...validation, { rule: 'mandatory', message: 'This field is required' }] };
                } else if (!value && hasRequired) {
                    newObj.rules = { ...rules, validation: validation.filter((v: any) => v.rule !== 'mandatory') };
                }
            } else {
                // Dynamic property mapping
                // @ts-ignore
                const path = getPropertyPath(field.type, property);
                if (path) {
                    set(newObj, path, value);
                }
            }

            const newJson = JSON.stringify(newObj, null, 2);
            setJsonValue(newJson);
            onUpdate(newObj);
        } catch (e) {
            console.error('Error updating field', e);
        }
    };

    const handleApply = () => {
        try {
            const parsed = JSON.parse(jsonValue);
            onUpdate(parsed);
        } catch (e) {
            setJsonError('Invalid JSON');
        }
    };

    const handleApplyForm = () => {
        try {
            const parsed = JSON.parse(formJsonValue);
            if (onAllFieldsChange) {
                onAllFieldsChange(parsed);
            }
        } catch (e) {
            setJsonError('Invalid JSON');
        }
    };

    // Render Form Mode
    if (mode === 'form') {
        return (
            <Paper elevation={0} sx={PANEL_SX}>
                <Box sx={HEADER_SX}>
                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="editor mode"
                        fullWidth
                        size="small"
                        sx={{ mb: 1.5 }}
                    >
                        <ToggleButton value="individual">Individual</ToggleButton>
                        <ToggleButton value="form">Form JSON</ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99,102,241,0.12)', color: 'primary.main' }}>
                            <Icon fontSize="small">data_object</Icon>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>Form Schema</Typography>
                            <Typography variant="caption" sx={{
                                color: "text.secondary"
                            }}>Edit the entire form as JSON</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <TextField
                        multiline
                        minRows={20}
                        maxRows={50}
                        value={formJsonValue}
                        onChange={handleFormJsonChange}
                        error={!!jsonError}
                        helperText={jsonError}
                        fullWidth
                        variant="outlined"
                        placeholder="Paste form JSON here..."
                        slotProps={{
                            input: {
                                style: { fontFamily: 'Consolas, Monaco, monospace', fontSize: 12 }
                            }
                        }}
                    />
                </Box>
                <Box sx={ACTION_BAR_SX}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleApplyForm}
                        disabled={!!jsonError}
                        startIcon={<Icon>save</Icon>}
                    >
                        Apply Form Schema
                    </Button>
                </Box>
            </Paper>
        );
    }

    // Render Individual Mode (Empty State)
    if (!field) {
        return (
            <Paper elevation={0} sx={PANEL_SX}>
                <Box sx={HEADER_SX}>
                    <ToggleButtonGroup
                        value={mode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="editor mode"
                        fullWidth
                        size="small"
                    >
                        <ToggleButton value="individual">Individual</ToggleButton>
                        <ToggleButton value="form">Form JSON</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', p: 4, textAlign: 'center' }}>
                    <Box sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(236,72,153,0.12) 100%)',
                        mb: 2,
                    }}>
                        <Icon sx={{ fontSize: 36, color: 'primary.main' }}>tune</Icon>
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>No component selected</Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            mt: 0.5,
                            maxWidth: 240
                        }}>
                        Double-click a component in the canvas to edit its properties here.
                    </Typography>
                </Box>
            </Paper>
        );
    }

    // Render Individual Mode (Editor)
    // @ts-ignore
    const fieldId = field.id || field.props?.id || '';
    const parsedField = tryParse(jsonValue);
    const isRequired = parsedField?.rules?.validation?.some((v: any) => v.rule === 'mandatory') || false;

    // @ts-ignore
    const fieldType = field.type;

    return (
        <Paper elevation={0} sx={PANEL_SX}>
            <Box sx={HEADER_SX}>
                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    aria-label="editor mode"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="individual">Individual</ToggleButton>
                    <ToggleButton value="form">Form JSON</ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(99,102,241,0.12)', color: 'primary.main', flexShrink: 0 }}>
                        <Icon fontSize="small">tune</Icon>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, textTransform: 'capitalize' }}>
                            {field.type} Properties
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "text.secondary",
                                display: 'block',
                                fontFamily: 'monospace',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                            {fieldId}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>

                {/* Visual Editor */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "text.secondary",
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75
                        }}>
                        <Icon sx={{ fontSize: 15, color: 'primary.main' }}>bolt</Icon> Quick Edit
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TextField
                            label={['button', 'typography'].includes(fieldType || '') ? "Text" : "Label"}
                            size="small"
                            // @ts-ignore
                            value={get(parsedField, getPropertyPath(fieldType || '', 'label')) || ''}
                            onChange={(e) => handleQuickUpdate('label', e.target.value)}
                            fullWidth
                        />
                        {client && (
                            <AITextAssist
                                client={client}
                                // @ts-ignore
                                text={get(parsedField, getPropertyPath(fieldType || '', 'label')) || ''}
                                onResult={(t) => handleQuickUpdate('label', t)}
                                size="small"
                            />
                        )}
                    </Box>

                    {/* Placeholder - Only relevant for inputs */}
                    {!['checkbox', 'switch', 'radio', 'button', 'typography', 'divider'].includes(fieldType || '') && (
                        <TextField
                            label="Placeholder"
                            size="small"
                            // @ts-ignore
                            value={get(parsedField, getPropertyPath(fieldType || '', 'placeholder')) || ''}
                            onChange={(e) => handleQuickUpdate('placeholder', e.target.value)}
                            fullWidth
                        />
                    )}

                    {/* Helper Text - Only relevant for inputs */}
                    {!['checkbox', 'switch', 'radio', 'button', 'typography', 'divider', 'datatable'].includes(fieldType || '') && (
                        <TextField
                            label="Helper Text"
                            size="small"
                            // @ts-ignore
                            value={get(parsedField, getPropertyPath(fieldType || '', 'helperText')) || ''}
                            onChange={(e) => handleQuickUpdate('helperText', e.target.value)}
                            fullWidth
                        />
                    )}

                    <FormControlLabel
                        control={
                            <Switch
                                checked={isRequired}
                                onChange={(e) => handleQuickUpdate('required', e.target.checked)}
                                size="small"
                            />
                        }
                        label="Required Field"
                    />
                </Box>

                <Divider />

                <Typography
                    variant="overline"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75
                    }}>
                    <Icon sx={{ fontSize: 15, color: 'secondary.main' }}>data_object</Icon> Advanced JSON
                </Typography>
                <TextField
                    multiline
                    minRows={10}
                    maxRows={20}
                    value={jsonValue}
                    onChange={handleChange}
                    error={!!jsonError}
                    helperText={jsonError}
                    fullWidth
                    variant="outlined"
                    slotProps={{
                        input: {
                            style: { fontFamily: 'Consolas, Monaco, monospace', fontSize: 12 }
                        }
                    }}
                />
            </Box>

            <Box sx={ACTION_BAR_SX}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleApply}
                    disabled={!!jsonError}
                    startIcon={<Icon>save</Icon>}
                >
                    Apply Changes
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => onDelete(fieldId)}
                    startIcon={<Icon>delete</Icon>}
                >
                    Delete Component
                </Button>
            </Box>
        </Paper>
    );
};

const tryParse = (json: string) => {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
};
