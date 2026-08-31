import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { AIClient } from '../types';
import type { FormField } from '../../types';

export interface AIVisionImportProps {
    client: AIClient;
    /** 'generate' → digitize a form image into a schema; 'fill' → read a document into fields. */
    mode?: 'generate' | 'fill';
    /** For 'fill' mode: the form to populate (fields are derived from it). */
    schema?: FormField[];
    /** For 'fill' mode: explicit field list (overrides schema). */
    fields?: { id: string; label?: string; type?: string }[];
    onGenerate?: (fields: FormField[]) => void;
    onFill?: (values: Record<string, any>) => void;
    label?: string;
    accept?: string;
}

const readAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

const deriveFields = (schema?: FormField[], fields?: AIVisionImportProps['fields']) => {
    if (fields) return fields;
    return (schema || [])
        .map((f) => ({ id: (f.id || f.props?.id) as string, label: f.props?.MuiAttributes?.label, type: f.type }))
        .filter((f) => !!f.id);
};

/** Upload a document/photo and let AI (vision) either build a form from it or fill fields. */
export default function AIVisionImport({
    client,
    mode = 'generate',
    schema,
    fields,
    onGenerate,
    onFill,
    label,
    accept = 'image/*',
}: AIVisionImportProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [dataUrl, setDataUrl] = React.useState<string>('');
    const [fileName, setFileName] = React.useState<string>('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        try {
            setDataUrl(await readAsDataUrl(file));
            setFileName(file.name);
        } catch {
            setError('Could not read the file.');
        }
    };

    const run = async () => {
        if (!dataUrl) return;
        setLoading(true);
        setError(null);
        try {
            if (mode === 'fill') {
                const values = await client.extractFromImage(dataUrl, deriveFields(schema, fields));
                onFill?.(values || {});
            } else {
                const result = await client.generateFormFromImage(dataUrl);
                onGenerate?.(result || []);
            }
        } catch (err: any) {
            setError(err?.message || 'AI request failed.');
        } finally {
            setLoading(false);
        }
    };

    const actionLabel = label || (mode === 'fill' ? 'Read document into form' : 'Build form from image');

    return (
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
            <Stack spacing={1.5}>
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={onPick}
                    style={{ display: 'none' }}
                    aria-label="vision-file"
                />
                <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => inputRef.current?.click()}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    {fileName || 'Choose image / document'}
                </Button>

                {dataUrl && accept.includes('image') ? (
                    <Box
                        component="img"
                        src={dataUrl}
                        alt="preview"
                        sx={{ maxHeight: 160, maxWidth: '100%', borderRadius: 1.5, objectFit: 'contain', border: '1px solid', borderColor: 'divider' }}
                    />
                ) : null}

                <Button
                    variant="contained"
                    onClick={run}
                    disabled={!dataUrl || loading}
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}
                >
                    {actionLabel}
                </Button>

                {error ? <Alert severity="error">{error}</Alert> : null}
                <Typography variant="caption" sx={{
                    color: "text.secondary"
                }}>
                    Image is sent to your AI proxy for one-time processing.
                </Typography>
            </Stack>
        </Box>
    );
}
