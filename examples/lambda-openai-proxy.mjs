/**
 * AWS Lambda handler (Node.js 20+) — OpenAI proxy for dynamic-mui AI features.
 * Deploy behind a Lambda **Function URL** (simplest, HTTPS, no 30s API-GW cap).
 *
 * The browser AI client POSTs { model, messages, temperature, response_format? };
 * this handler injects the OpenAI key (server-side) and returns OpenAI's response.
 *
 * ── Key source (two modes) ─────────────────────────────────────────────
 *   • BYOK (this app's default): the frontend sends the OpenAI key in the
 *     `x-openai-key` header. The Lambda stores NO secret — it just relays.
 *     Only expose the Build-with-AI UI to TRUSTED users, since the key lives
 *     in their browser session.
 *   • Server-held: set OPENAI_API_KEY as a Lambda env var and the frontend
 *     sends no key. Used when the key must never reach the browser.
 *
 * ── Environment variables (all optional) ───────────────────────────────
 *   OPENAI_API_KEY   fallback key when the request omits x-openai-key
 *   ALLOWED_ORIGIN   e.g. https://app.yourco.com  (default '*')
 *   PROXY_SECRET     if set, callers must also send header x-proxy-secret
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const ALLOWED_MODELS = new Set(['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'gpt-4.1']);

// NOTE: CORS is handled by the Lambda **Function URL** CORS config (AWS injects the
// Access-Control-* headers and answers OPTIONS preflight). The handler must NOT set
// them too, or the browser sees duplicate Access-Control-Allow-Origin values.
const reply = (statusCode, obj) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj),
});

export const handler = async (event) => {
    const method = event?.requestContext?.http?.method || event?.httpMethod || 'POST';

    // Preflight is normally served by the Function URL CORS config; this is a fallback.
    if (method === 'OPTIONS') return { statusCode: 204, headers: {}, body: '' };
    if (method !== 'POST') return reply(405, { error: 'method_not_allowed' });

    // Optional shared-secret gate
    if (process.env.PROXY_SECRET) {
        const headers = event.headers || {};
        const provided = headers['x-proxy-secret'] || headers['X-Proxy-Secret'];
        if (provided !== process.env.PROXY_SECRET) return reply(401, { error: 'unauthorized' });
    }
    // (For Cognito: verify the Bearer JWT from event.headers.authorization here.)

    // BYOK: prefer the key supplied by the caller; fall back to a server-held env key.
    const hdrs = event.headers || {};
    const apiKey = hdrs['x-openai-key'] || hdrs['X-Openai-Key'] || process.env.OPENAI_API_KEY;
    if (!apiKey) return reply(400, { error: 'no_openai_key', message: 'Provide x-openai-key header or set OPENAI_API_KEY.' });

    let payload;
    try {
        const raw = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '{}');
        payload = JSON.parse(raw);
    } catch {
        return reply(400, { error: 'invalid_json' });
    }

    const { model = 'gpt-4o-mini', messages, temperature = 0.2, response_format } = payload;
    if (!Array.isArray(messages) || messages.length === 0) return reply(400, { error: 'messages[] is required' });
    const safeModel = ALLOWED_MODELS.has(model) ? model : 'gpt-4o-mini';

    try {
        const upstream = await fetch(OPENAI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: safeModel, messages, temperature, max_tokens: 2048,
                ...(response_format ? { response_format } : {}),
            }),
        });
        const data = await upstream.json();
        return reply(upstream.status, data);
    } catch (err) {
        console.error('proxy error:', err);
        return reply(502, { error: 'upstream_error' });
    }
};
