import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { alpha } from '@mui/material/styles';
import useUpdateEffect from '../../../util/useUpdateEffect';
import { premiumInputSx, mergeSx } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** Escape HTML-significant characters so user input can never inject markup. */
function escapeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * A small, safe markdown → HTML converter.
 * The input is HTML-escaped FIRST, so the regex passes below can only ever
 * introduce the whitelisted tags we generate — never markup from user input.
 */
function markdownToHtml(markdown: string): string {
    let html = escapeHtml(markdown || '');

    // Headings (order matters: longest prefix first).
    html = html.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

    // Unordered lists: group consecutive "- item" lines into a single <ul>.
    html = html.replace(/(?:^-\s+.*(?:\n|$))+/gm, (block) => {
        const items = block
            .trimEnd()
            .split('\n')
            .map((line) => line.replace(/^-\s+(.*)$/, '<li>$1</li>'))
            .join('');
        return `<ul>${items}</ul>`;
    });

    // Links: [text](url) — url is already escaped, so quotes/angle brackets are safe.
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

    // Inline code.
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold before italic so ** is not eaten by the single-* rule.
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Paragraphs / line breaks for remaining plain text.
    html = html
        .split(/\n{2,}/)
        .map((chunk) => {
            const trimmed = chunk.trim();
            if (!trimmed) return '';
            // Leave block-level elements we already produced untouched.
            if (/^<(h1|h2|h3|ul|pre)/.test(trimmed)) return trimmed;
            return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
        })
        .join('');

    return html;
}

/** MarkdownEditor Control — a multiline editor with a toggleable HTML preview. */
export default function MarkdownEditor({ attributes = {}, rules = {}, onChange }: ControlProps) {
    const { id = '', label, rows = 6, MuiAttributes = {} } = attributes;
    const { sx: muiSx, ...otherMuiAttributes } = MuiAttributes;

    const [value, setValue] = React.useState<string>((attributes.value as string) || '');
    const [preview, setPreview] = React.useState(false);

    useUpdateEffect(() => {
        setValue((attributes.value as string) || '');
    }, [attributes.value]);

    const isMandatory =
        rules?.validation?.some(
            (v: any) => v.rule === 'mandatory' || v.rule === 'mandatoryselect',
        ) || false;

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const next = event.target.value;
        setValue(next);
        onChange?.({ id, value: next });
    };

    return (
        <FormControl required={isMandatory} component="fieldset" fullWidth>
            <Stack
                direction="row"
                sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1
                }}>
                {label ? <FormLabel component="legend">{label}</FormLabel> : <span />}
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setPreview((p) => !p)}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                >
                    {preview ? 'Write' : 'Preview'}
                </Button>
            </Stack>

            {preview ? (
                <Box
                    data-testid="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
                    sx={{
                        minHeight: (theme) => theme.spacing(rows * 3),
                        p: 2,
                        borderRadius: '10px',
                        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                        backgroundColor: (theme) => theme.palette.background.paper,
                        '& :first-of-type': { mt: 0 },
                        '& :last-child': { mb: 0 },
                    }}
                />
            ) : (
                <TextField
                    id={id || undefined}
                    value={value}
                    onChange={handleChange}
                    multiline
                    minRows={rows}
                    fullWidth
                    placeholder="Write markdown…"
                    {...otherMuiAttributes}
                    sx={mergeSx(premiumInputSx as any, muiSx)}
                    slotProps={{
                        htmlInput: { 'aria-label': label || 'markdown editor' }
                    }} />
            )}
        </FormControl>
    );
}
