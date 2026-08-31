import React, { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { AIClient, ExtractionField } from '../types';
import type { FormField } from '../../types';
import { fieldsForExtraction } from '../mapping';

/** A field descriptor understood by `AIClient.extractToFields`. */
export type AIFillField = ExtractionField;

export interface AIFillProps {
    /** Injected, provider-agnostic AI client. This component never calls the network directly. */
    client: AIClient;
    /** Full form schema; field descriptors are derived from it when `fields` is omitted. */
    schema?: FormField[];
    /** Explicit field descriptors. Takes precedence over `schema`. */
    fields?: AIFillField[];
    /** Called with the extracted values (always called, even with `{}`). */
    onFill: (values: Record<string, any>) => void;
    /** Placeholder for the paste box. */
    placeholder?: string;
    /** Label for the paste box. */
    label?: string;
}

/**
 * "Paste to autofill": the user pastes free text, and the injected `AIClient`
 * extracts values for the form's fields.
 */
export const AIFill: React.FC<AIFillProps> = ({
    client,
    schema,
    fields,
    onFill,
    placeholder = 'Paste any text here (an email, a note, an address…) and let AI fill the form.',
    label = 'Paste text to autofill',
}) => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const derivedFields: AIFillField[] =
        fields ?? (schema ? fieldsForExtraction(schema) : []);

    const handleAutofill = async () => {
        setLoading(true);
        setError(null);
        try {
            const values = await client.extractToFields(text, derivedFields);
            onFill(values ?? {});
        } catch (err: any) {
            setError(err?.message || 'Failed to extract values from the text.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                label={label}
                placeholder={placeholder}
                multiline
                minRows={4}
                fullWidth
                disabled={loading}
                sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                }}
                slotProps={{
                    htmlInput: { 'aria-label': label }
                }}
            />

            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Stack direction="row" sx={{
                justifyContent: "flex-end"
            }}>
                <Button
                    variant="contained"
                    onClick={handleAutofill}
                    disabled={loading}
                    startIcon={
                        loading ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <AutoFixHighIcon />
                        )
                    }
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 2.5 }}
                >
                    {loading ? 'Autofilling…' : 'Autofill from text'}
                </Button>
            </Stack>
        </Box>
    );
};

export default AIFill;
