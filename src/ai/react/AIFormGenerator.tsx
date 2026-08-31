import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
} from '@mui/material';
import { AIClient } from '../types';
import type { FormField } from '../../types';

export interface AIFormGeneratorProps {
    /** Provider-agnostic AI client (injected). Never calls the network directly. */
    client: AIClient;
    /** When provided and non-empty, the component edits this form instead of generating a new one. */
    current?: FormField[];
    /** Called with the generated (or edited) form schema. */
    onGenerate: (fields: FormField[]) => void;
    /** Placeholder text for the prompt input. */
    placeholder?: string;
    /** Label for the prompt input. */
    label?: string;
}

/**
 * A small, self-contained UI that turns a natural-language prompt into a
 * renderable form schema via an injected `AIClient`. When `current` is a
 * non-empty array it applies the prompt as an edit to that form instead.
 */
export default function AIFormGenerator({
    client,
    current,
    onGenerate,
    placeholder,
    label,
}: AIFormGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = Array.isArray(current) && current.length > 0;
    const buttonLabel = isEdit ? 'Apply edit' : 'Generate form';

    const handleSubmit = async () => {
        const trimmed = prompt.trim();
        if (!trimmed || loading) return;

        setLoading(true);
        setError(null);
        try {
            const fields = isEdit
                ? await client.editForm(current as FormField[], trimmed)
                : await client.generateForm(trimmed);
            onGenerate(fields);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
        >
            <Stack spacing={2}>
                <TextField
                    label={label ?? 'Describe your form'}
                    placeholder={
                        placeholder ??
                        (isEdit
                            ? 'e.g. Add a phone number field and make email required'
                            : 'e.g. A contact form with name, email and message')
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    multiline
                    minRows={3}
                    fullWidth
                    disabled={loading}
                    slotProps={{
                        input: { sx: { borderRadius: 2 } }
                    }}
                />

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !prompt.trim()}
                        startIcon={
                            loading ? <CircularProgress size={18} color="inherit" /> : undefined
                        }
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                        }}
                    >
                        {buttonLabel}
                    </Button>
                </Box>
            </Stack>
        </Box>
    );
}
