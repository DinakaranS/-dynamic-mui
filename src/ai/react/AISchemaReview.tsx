import { useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    List,
    ListItem,
    Stack,
    Typography,
} from '@mui/material';
import { AIClient, ReviewResult } from '../types';
import type { FormField } from '../../types';

export interface AISchemaReviewProps {
    /** Provider-agnostic AI client (injected). Never calls the network directly. */
    client: AIClient;
    /** The form schema to audit. */
    schema: FormField[];
    /** Called with `result.improved` when the user applies the AI's improvements. */
    onApply?: (fields: FormField[]) => void;
    /** Label for the review button. */
    buttonLabel?: string;
}

type Severity = ReviewResult['issues'][number]['severity'];

/** Maps an issue severity to an MUI Chip colour. */
const severityColor: Record<Severity, 'warning' | 'info' | 'default'> = {
    warning: 'warning',
    suggestion: 'info',
    info: 'default',
};

/**
 * Audits a form schema through an injected `AIClient` and presents the returned
 * issues as a tidy list. When the client returns an improved schema and an
 * `onApply` handler is provided, the user can apply it wholesale.
 */
export default function AISchemaReview({
    client,
    schema,
    onApply,
    buttonLabel,
}: AISchemaReviewProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ReviewResult | null>(null);

    const handleReview = async () => {
        if (loading) return;

        setLoading(true);
        setError(null);
        try {
            const res = await client.reviewForm(schema);
            setResult(res);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const canApply = !!result?.improved && !!onApply;

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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                    <Button
                        variant="contained"
                        onClick={handleReview}
                        disabled={loading}
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
                        {buttonLabel ?? 'Review with AI'}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {result && result.issues.length === 0 && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                        No issues found
                    </Alert>
                )}

                {result && result.issues.length > 0 && (
                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {result.issues.map((issue, index) => (
                            <ListItem
                                key={index}
                                alignItems="flex-start"
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'action.hover',
                                }}
                            >
                                <Stack spacing={0.75} sx={{ width: '100%' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: 0.75,
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={issue.severity}
                                            color={severityColor[issue.severity]}
                                            sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                                        />
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={issue.kind}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                        {issue.field && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontFamily: 'monospace',
                                                    color: 'text.secondary',
                                                }}
                                            >
                                                {issue.field}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography variant="body2">{issue.message}</Typography>
                                </Stack>
                            </ListItem>
                        ))}
                    </List>
                )}

                {canApply && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => onApply!(result!.improved!)}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                            }}
                        >
                            Apply improvements
                        </Button>
                    </Box>
                )}
            </Stack>
        </Box>
    );
}
