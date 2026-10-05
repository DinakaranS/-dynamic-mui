/**
 * Reference OpenAI proxy for dynamic-mui's AI features.
 *
 * WHY THIS EXISTS: the OpenAI API key must NEVER ship in your browser bundle
 * (anyone could read it from devtools). The dynamic-mui AI client instead POSTs
 * OpenAI-style chat requests to an endpoint YOU host — this proxy — which injects
 * the key server-side and forwards to OpenAI.
 *
 * The client sends: { model, messages, temperature, response_format? }
 * This proxy returns OpenAI's raw response unchanged.
 *
 * Run:
 *   npm i express cors
 *   OPENAI_API_KEY=sk-... node examples/openai-proxy.js
 * Then in your app:
 *   const ai = createAIClient({ endpoint: 'http://localhost:8787/ai' });
 *
 * Hardening for production: restrict CORS to your origin, add auth (only your
 * logged-in users should reach this), rate-limit, and optionally allow-list the
 * `model` and cap `max_tokens`.
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ALLOWED_MODELS = new Set(['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']);

app.post('/ai', async (req, res) => {
    try {
        const { model = 'gpt-4o-mini', messages, temperature = 0.2, response_format } = req.body || {};
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'messages[] is required' });
        }
        const safeModel = ALLOWED_MODELS.has(model) ? model : 'gpt-4o-mini';

        const upstream = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: safeModel,
                messages,
                temperature,
                max_tokens: 2048,
                ...(response_format ? { response_format } : {}),
            }),
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (err) {
        console.error('proxy error', err);
        return res.status(500).json({ error: 'proxy_error' });
    }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`dynamic-mui AI proxy on :${port}/ai`));
