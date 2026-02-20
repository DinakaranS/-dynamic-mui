import React from 'react';
import ReactDOM from 'react-dom/client';
import { Builder } from './playground/Builder';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Builder />
        </ThemeProvider>
    </React.StrictMode>
);
