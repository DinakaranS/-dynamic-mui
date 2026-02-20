import { createTheme, alpha } from '@mui/material/styles';

// Premium color palette
const PRIMARY_MAIN = '#6366f1'; // Indigo-500
const SECONDARY_MAIN = '#ec4899'; // Pink-500
const SUCCESS_MAIN = '#10b981'; // Emerald-500
const ERROR_MAIN = '#ef4444'; // Red-500

export const theme = createTheme({
    palette: {
        primary: {
            main: PRIMARY_MAIN,
            light: alpha(PRIMARY_MAIN, 0.5),
            dark: '#4338ca', // Indigo-700
            contrastText: '#ffffff',
        },
        secondary: {
            main: SECONDARY_MAIN,
            light: alpha(SECONDARY_MAIN, 0.5),
            dark: '#be185d', // Pink-700
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc', // Slate-50
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b', // Slate-800
            secondary: '#64748b', // Slate-500
        },
        success: { main: SUCCESS_MAIN },
        error: { main: ERROR_MAIN },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
                elevation2: {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});
