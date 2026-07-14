import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { TextField, Stack, Alert } from '@mui/material';
import { createAIClient, AIClient } from '../ai';

// Deployed BYOK Lambda relay (holds no secret — the key is sent per request).
const DEFAULT_ENDPOINT = 'https://7e53l6xunmegvuewlsc4ssovim0xrvyk.lambda-url.us-east-1.on.aws/';
const ENDPOINT_KEY = 'dynamic-mui:ai-endpoint';
const KEY_KEY = 'dynamic-mui:ai-key';

interface AICtx {
    endpoint: string;
    apiKey: string;
    setEndpoint: (v: string) => void;
    setApiKey: (v: string) => void;
    client: AIClient | null;
    configured: boolean;
}

const Ctx = createContext<AICtx | null>(null);

/** Holds the AI config (URL + key) once, shared by every AI feature in the builder. */
export const AIProvider = ({ children }: { children: ReactNode }) => {
    const [endpoint, setEndpointState] = useState<string>(() => {
        try { return localStorage.getItem(ENDPOINT_KEY) || DEFAULT_ENDPOINT; } catch { return DEFAULT_ENDPOINT; }
    });
    const [apiKey, setApiKeyState] = useState<string>(() => {
        try { return sessionStorage.getItem(KEY_KEY) || ''; } catch { return ''; }
    });

    const setEndpoint = (v: string) => {
        setEndpointState(v);
        try { localStorage.setItem(ENDPOINT_KEY, v); } catch { /* ignore */ }
    };
    const setApiKey = (v: string) => {
        setApiKeyState(v);
        try { sessionStorage.setItem(KEY_KEY, v); } catch { /* ignore */ }
    };

    const client = useMemo<AIClient | null>(() => {
        if (!endpoint || !apiKey) return null;
        try { return createAIClient({ endpoint, headers: { 'x-openai-key': apiKey } }); } catch { return null; }
    }, [endpoint, apiKey]);

    const value: AICtx = { endpoint, apiKey, setEndpoint, setApiKey, client, configured: !!client };
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAI = (): AICtx => {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useAI must be used within <AIProvider>');
    return ctx;
};

/** Reusable URL + key inputs bound to the shared config. */
export const AIConfigFields = () => {
    const { endpoint, apiKey, setEndpoint, setApiKey, configured } = useAI();
    return (
        <Stack spacing={2}>
            <TextField
                label="Lambda / proxy URL"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                helperText="BYOK relay URL — stores no secret; your key is sent per request over HTTPS."
                fullWidth
                size="small"
            />
            <TextField
                label="OpenAI API key"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                helperText="Kept only in this browser session; sent as the x-openai-key header."
                fullWidth
                size="small"
            />
            {!configured && <Alert severity="info">Enter the relay URL and your OpenAI key to enable AI features.</Alert>}
        </Stack>
    );
};
