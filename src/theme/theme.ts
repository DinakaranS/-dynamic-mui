import { createTheme, alpha } from '@mui/material/styles';

// Premium color palette
const PRIMARY_MAIN = '#6366f1'; // Indigo-500
const PRIMARY_DARK = '#4338ca'; // Indigo-700
const SECONDARY_MAIN = '#ec4899'; // Pink-500
const SUCCESS_MAIN = '#10b981'; // Emerald-500
const WARNING_MAIN = '#f59e0b'; // Amber-500
const INFO_MAIN = '#0ea5e9'; // Sky-500
const ERROR_MAIN = '#ef4444'; // Red-500

// Shared gradients / shadow tokens (kept here so components can reference via theme if needed)
export const GRADIENTS = {
    primary: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, #8b5cf6 100%)`,
    brand: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${SECONDARY_MAIN} 100%)`,
    surface: 'linear-gradient(180deg, #ffffff 0%, #fbfbff 100%)',
};

export const theme = createTheme({
    palette: {
        primary: {
            main: PRIMARY_MAIN,
            light: '#a5b4fc', // Indigo-300 — a real light, not an alpha
            dark: PRIMARY_DARK,
            contrastText: '#ffffff',
        },
        secondary: {
            main: SECONDARY_MAIN,
            light: '#f9a8d4', // Pink-300
            dark: '#be185d', // Pink-700
            contrastText: '#ffffff',
        },
        background: {
            default: '#f6f7fb', // soft cool grey
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b', // Slate-800
            secondary: '#64748b', // Slate-500
        },
        success: { main: SUCCESS_MAIN },
        warning: { main: WARNING_MAIN },
        info: { main: INFO_MAIN },
        error: { main: ERROR_MAIN },
        divider: 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 800, letterSpacing: '-0.02em' },
        h5: { fontWeight: 800, letterSpacing: '-0.02em' },
        h6: { fontWeight: 700, letterSpacing: '-0.01em' },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        body2: { lineHeight: 1.6 },
        overline: { fontWeight: 700, letterSpacing: '0.08em' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                // Anchor the app to the real viewport so `height: 100%` fills exactly
                // (avoids the `100vh` overflow that produces a second, document-level
                // scrollbar next to the app's own scroll regions). No `overflow: hidden`
                // here — that would let programmatic scrollIntoView drag the whole app
                // and strand the header with no scrollbar to get back.
                'html, body, #root': {
                    height: '100%',
                },
                '*::-webkit-scrollbar': {
                    width: 10,
                    height: 10,
                },
                '*::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha('#64748b', 0.28),
                    borderRadius: 8,
                    border: '2px solid transparent',
                    backgroundClip: 'padding-box',
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: alpha('#64748b', 0.45),
                },
            },
        },
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    boxShadow: 'none',
                    fontWeight: 600,
                    paddingInline: 16,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                containedPrimary: {
                    background: GRADIENTS.primary,
                    boxShadow: `0 6px 16px -4px ${alpha(PRIMARY_MAIN, 0.5)}`,
                    '&:hover': {
                        background: GRADIENTS.primary,
                        filter: 'brightness(1.05)',
                        boxShadow: `0 10px 22px -6px ${alpha(PRIMARY_MAIN, 0.6)}`,
                        transform: 'translateY(-1px)',
                    },
                },
                outlined: {
                    borderColor: alpha('#0f172a', 0.12),
                    backgroundColor: alpha('#ffffff', 0.6),
                    '&:hover': {
                        borderColor: PRIMARY_MAIN,
                        backgroundColor: alpha(PRIMARY_MAIN, 0.06),
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0 1px 2px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.05)',
                },
                elevation2: {
                    boxShadow: '0 4px 12px -2px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.06)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: '#ffffff',
                        transition: 'box-shadow 0.2s, border-color 0.2s',
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 4px ${alpha(PRIMARY_MAIN, 0.12)}`,
                        },
                    },
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: alpha('#0f172a', 0.1),
                    '&.Mui-selected': {
                        backgroundColor: alpha(PRIMARY_MAIN, 0.12),
                        color: PRIMARY_DARK,
                        '&:hover': {
                            backgroundColor: alpha(PRIMARY_MAIN, 0.18),
                        },
                    },
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#0f172a',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 500,
                    paddingBlock: 6,
                    paddingInline: 10,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 18,
                    boxShadow: '0 30px 60px -12px rgba(15,23,42,0.28)',
                },
            },
        },
    },
});
