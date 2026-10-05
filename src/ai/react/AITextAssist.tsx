import { useCallback, useState } from 'react';
import type { ReactElement } from 'react';
import {
    CircularProgress,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ShortTextIcon from '@mui/icons-material/ShortText';
import NotesIcon from '@mui/icons-material/Notes';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import { AIClient, AssistAction } from '../types';

/**
 * Return value of {@link useAIAssist}. `run` invokes the injected client's
 * `assistText`, tracking `loading`/`error` and resolving with the result text.
 */
export interface UseAIAssist {
    run: (text: string, action: AssistAction, targetLanguage?: string) => Promise<string>;
    loading: boolean;
    error: string | null;
}

/**
 * Headless hook around an injected {@link AIClient}. Never calls the network
 * directly — it delegates to `client.assistText` and surfaces loading/error.
 */
export function useAIAssist(client: AIClient): UseAIAssist {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const run = useCallback(
        async (text: string, action: AssistAction, targetLanguage?: string): Promise<string> => {
            setLoading(true);
            setError(null);
            try {
                const result = await client.assistText(text, action, targetLanguage);
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                setError(message);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [client],
    );

    return { run, loading, error };
}

/** Human-friendly labels + icons for each assist action. */
const ACTION_META: Record<AssistAction, { label: string; icon: ReactElement }> = {
    improve: { label: 'Improve writing', icon: <AutoAwesomeIcon fontSize="small" /> },
    summarize: { label: 'Summarize', icon: <ShortTextIcon fontSize="small" /> },
    expand: { label: 'Expand', icon: <NotesIcon fontSize="small" /> },
    shorten: { label: 'Make shorter', icon: <EditNoteIcon fontSize="small" /> },
    'fix-grammar': { label: 'Fix spelling & grammar', icon: <SpellcheckIcon fontSize="small" /> },
    professional: { label: 'Make professional', icon: <WorkOutlineIcon fontSize="small" /> },
    translate: { label: 'Translate', icon: <TranslateIcon fontSize="small" /> },
};

const DEFAULT_ACTIONS: AssistAction[] = [
    'improve',
    'summarize',
    'expand',
    'shorten',
    'fix-grammar',
    'professional',
    'translate',
];

export interface AITextAssistProps {
    /** Provider-agnostic AI client (injected). Never calls the network directly. */
    client: AIClient;
    /** The text the selected action operates on. */
    text: string;
    /** Which assist actions to offer. Defaults to all seven. */
    actions?: AssistAction[];
    /** Called with the transformed text once an action resolves. */
    onResult: (text: string) => void;
    /** Target language, forwarded for the `translate` action. */
    targetLanguage?: string;
    /** Size of the trigger icon button. */
    size?: 'small' | 'medium';
}

/**
 * A compact "AI assist" trigger: an icon button that opens a menu of text
 * transformations (improve, summarize, translate, …). Selecting one runs it
 * through the injected {@link AIClient} and hands the result to `onResult`.
 */
export default function AITextAssist({
    client,
    text,
    actions = DEFAULT_ACTIONS,
    onResult,
    targetLanguage,
    size = 'medium',
}: AITextAssistProps) {
    const { run, loading } = useAIAssist(client);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = async (action: AssistAction) => {
        setAnchorEl(null);
        try {
            const result = await run(text, action, targetLanguage);
            onResult(result);
        } catch {
            // Error is surfaced via the hook's `error` state; swallow here so a
            // rejected action doesn't produce an unhandled rejection.
        }
    };

    return (
        <>
            <Tooltip title="AI assist">
                <span>
                    <IconButton
                        aria-label="AI assist"
                        aria-haspopup="menu"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleOpen}
                        disabled={loading}
                        size={size}
                        sx={{
                            color: 'primary.main',
                            borderRadius: 2,
                            transition: 'background-color 120ms ease',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={size === 'small' ? 16 : 20} color="inherit" />
                        ) : (
                            <AutoFixHighIcon fontSize={size === 'small' ? 'small' : 'medium'} />
                        )}
                    </IconButton>
                </span>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        elevation: 3,
                        sx: {
                            mt: 0.5,
                            minWidth: 220,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                        },
                    },
                }}
            >
                {actions.map((action) => {
                    const meta = ACTION_META[action];
                    return (
                        <MenuItem
                            key={action}
                            onClick={() => handleSelect(action)}
                            sx={{ py: 1, px: 1.5, gap: 0.5 }}
                        >
                            <ListItemIcon sx={{ color: 'primary.main', minWidth: 32 }}>
                                {meta?.icon ?? <AutoAwesomeIcon fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText
                                primary={meta?.label ?? action}
                                slotProps={{
                                    primary: { sx: { fontSize: 14, fontWeight: 500 } },
                                }}
                            />
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
