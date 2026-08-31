import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatUnderlined from '@mui/icons-material/FormatUnderlined';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import FormatClear from '@mui/icons-material/FormatClear';
import { alpha } from '@mui/material/styles';
import { PREMIUM_EASING, PREMIUM_RADIUS } from '../../../util/premiumStyles';
import { ControlProps } from '../../../types';

/** A single toolbar action. `command` is passed to `document.execCommand`. */
interface ToolbarAction {
    command: string;
    label: string;
    icon: React.ReactNode;
    /** For commands that need an argument (e.g. createLink). */
    prompt?: boolean;
}

const TOOLBAR_ACTIONS: ToolbarAction[] = [
    { command: 'bold', label: 'Bold', icon: <FormatBold fontSize="small" /> },
    { command: 'italic', label: 'Italic', icon: <FormatItalic fontSize="small" /> },
    { command: 'underline', label: 'Underline', icon: <FormatUnderlined fontSize="small" /> },
    { command: 'insertUnorderedList', label: 'Bulleted list', icon: <FormatListBulleted fontSize="small" /> },
    { command: 'insertOrderedList', label: 'Numbered list', icon: <FormatListNumbered fontSize="small" /> },
    { command: 'createLink', label: 'Insert link', icon: <LinkIcon sx={{
        fontSize: "small"
    }} />, prompt: true },
    { command: 'removeFormat', label: 'Clear formatting', icon: <FormatClear fontSize="small" /> },
];

/** RichTextEditor Component — a lightweight WYSIWYG editor over a contentEditable div. */
export default function RichTextEditor({ attributes = {}, onChange }: ControlProps) {
    const { id = '', label, minHeight = 160, MuiAttributes = {} } = attributes;
    const editorRef = React.useRef<HTMLDivElement | null>(null);

    // Hydrate the editable region on mount and whenever the external value changes,
    // but only when it differs from the current innerHTML — this keeps the caret
    // from jumping while the user types.
    React.useEffect(() => {
        const el = editorRef.current;
        if (!el) return;
        const next = attributes.value ?? '';
        if (el.innerHTML !== next) el.innerHTML = next;
    }, [attributes.value]);

    const runCommand = (action: ToolbarAction) => {
        editorRef.current?.focus();
        try {
            if (action.prompt) {
                const url = window.prompt('Enter a URL');
                if (url) document.execCommand(action.command, false, url);
            } else {
                document.execCommand(action.command);
            }
        } catch {
            /* execCommand is unreliable in some environments (e.g. jsdom); ignore. */
        }
        // Reflect any resulting change.
        if (editorRef.current) onChange?.({ id, value: editorRef.current.innerHTML });
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange?.({ id, value: e.currentTarget.innerHTML });
    };

    return (
        <FormControl fullWidth>
            {label && (
                <FormLabel sx={{ mb: 0.75, fontWeight: 500 }} component="legend">
                    {label}
                </FormLabel>
            )}
            <Paper
                variant="outlined"
                sx={(theme) => ({
                    borderRadius: `${PREMIUM_RADIUS + 2}px`,
                    borderColor: alpha(theme.palette.text.primary, 0.12),
                    overflow: 'hidden',
                    transition: `box-shadow .2s ${PREMIUM_EASING}, border-color .2s ${PREMIUM_EASING}`,
                    '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.06)}`,
                    },
                    '&:focus-within': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.16)}`,
                    },
                })}
            >
                <Box
                    sx={(theme) => ({
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 0.25,
                        px: 0.75,
                        py: 0.5,
                        backgroundColor: alpha(theme.palette.text.primary, 0.03),
                    })}
                >
                    {TOOLBAR_ACTIONS.map((action, index) => (
                        <React.Fragment key={action.command}>
                            {(index === 3 || index === 5) && (
                                <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
                            )}
                            <Tooltip title={action.label}>
                                <IconButton
                                    size="small"
                                    aria-label={action.label}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => runCommand(action)}
                                    sx={(theme) => ({
                                        borderRadius: `${PREMIUM_RADIUS - 2}px`,
                                        transition: `background-color .18s ${PREMIUM_EASING}, transform .18s ${PREMIUM_EASING}`,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            transform: 'translateY(-1px)',
                                        },
                                    })}
                                >
                                    {action.icon}
                                </IconButton>
                            </Tooltip>
                        </React.Fragment>
                    ))}
                </Box>
                <Divider />
                <Box
                    id={id}
                    ref={editorRef}
                    role="textbox"
                    aria-multiline="true"
                    aria-label={label || 'rich text'}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    {...MuiAttributes}
                    sx={(theme) => ({
                        minHeight,
                        px: 1.75,
                        py: 1.25,
                        outline: 'none',
                        lineHeight: 1.6,
                        color: theme.palette.text.primary,
                        backgroundColor: theme.palette.background.paper,
                        '& p': { margin: '0 0 0.5em' },
                        '& ul, & ol': { paddingLeft: '1.5em', margin: '0 0 0.5em' },
                        '& a': { color: theme.palette.primary.main },
                        ...(MuiAttributes.sx || {}),
                    })}
                />
            </Paper>
        </FormControl>
    );
}
