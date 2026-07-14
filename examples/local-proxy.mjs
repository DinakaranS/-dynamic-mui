/**
 * Zero-dependency local OpenAI proxy for dynamic-mui's AI features.
 *
 * Runs on Node 18+ (uses built-in fetch + http). Reads the key from the
 * OPENAI_API_KEY env var, or from a gitignored `examples/.env` file
 * (a line `OPENAI_API_KEY=sk-...`). The key never touches the browser.
 *
 *   node examples/local-proxy.mjs         # → http://localhost:8787/ai
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load OPENAI_API_KEY from env or examples/.env
let apiKey = process.env.OPENAI_API_KEY || '';
if (!apiKey) {
    try {
        const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        const match = envFile.match(/^\s*OPENAI_API_KEY\s*=\s*(.+)\s*$/m);
        if (match) apiKey = match[1].trim().replace(/^['"]|['"]$/g, '');
    } catch {
        /* no .env file */
    }
}

const PORT = process.env.PORT || 8787;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ALLOWED_MODELS = new Set(['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const cors = (res) => {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-openai-key');
};

const send = (res, code, obj) => {
    cors(res);
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
};

const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }
    if (req.method === 'GET' && req.url === '/health') {
        return send(res, 200, { ok: true, keyLoaded: !!apiKey });
    }
    if (req.method !== 'POST' || (req.url !== '/ai' && req.url !== '/')) {
        return send(res, 404, { error: 'not_found' });
    }
    // BYOK: prefer the key from the request header, fall back to env/.env.
    const reqKey = req.headers['x-openai-key'] || apiKey;
    if (!reqKey) return send(res, 400, { error: 'no_openai_key (send x-openai-key header or set examples/.env)' });

    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 5e6) req.destroy(); });
    req.on('end', async () => {
        try {
            const { model = 'gpt-4o-mini', messages, temperature = 0.2, response_format } = JSON.parse(body || '{}');
            if (!Array.isArray(messages) || messages.length === 0) {
                return send(res, 400, { error: 'messages[] is required' });
            }
            const safeModel = ALLOWED_MODELS.has(model) ? model : 'gpt-4o-mini';
            const upstream = await fetch(OPENAI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${reqKey}` },
                body: JSON.stringify({
                    model: safeModel, messages, temperature, max_tokens: 2048,
                    ...(response_format ? { response_format } : {}),
                }),
            });
            const data = await upstream.json();
            return send(res, upstream.status, data);
        } catch (err) {
            console.error('proxy error:', err.message);
            return send(res, 500, { error: 'proxy_error' });
        }
    });
});

server.listen(PORT, () => {
    console.log(`dynamic-mui AI proxy → http://localhost:${PORT}/ai  (key loaded: ${!!apiKey})`);
    if (!apiKey) console.log('⚠  No key yet. Put OPENAI_API_KEY=sk-... in examples/.env and restart.');
});
