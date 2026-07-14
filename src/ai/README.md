# dynamic-mui AI

AI-assisted authoring and filling for dynamic-mui forms. Because a form is just a
JSON schema (`FormField[]`), an LLM can generate, edit, review, and fill it natively.

## 🔒 Security — read this first

**Never put your OpenAI key in client code.** The AI client talks to an endpoint
**you host** (a tiny proxy that injects the key server-side). A ready-to-run
reference proxy is in [`examples/openai-proxy.js`](../../examples/openai-proxy.js).

```bash
OPENAI_API_KEY=sk-... node examples/openai-proxy.js   # exposes POST /ai
```

## Setup

```ts
import { createAIClient } from 'dynamic-mui';

const ai = createAIClient({
  endpoint: 'https://your-app.com/api/ai', // YOUR proxy — not api.openai.com
  model: 'gpt-4o-mini',                     // optional
  // headers: { Authorization: `Bearer ${sessionToken}` }, // optional auth to your proxy
  // headers: { 'x-openai-key': userKey },  // BYOK relay (key entered by a trusted user)
});
```

## Drop-in: `<AIForm>` (form + AI in one line)

The easiest way to add AI to a JSON-driven form. It renders `FormGenerator` from
your schema and manages the schema/values internally, with a small AI toolbar
(generate/edit, paste-to-fill, review). Fill values flow into the form via the
`patch` mechanism automatically.

```tsx
import { AIForm } from 'dynamic-mui';

<AIForm
  client={ai}
  data={schema}            // your FormField[] (JSON)
  guid="patient-form"
  enableGenerate           // show "Edit with AI"
  enableFill               // show "AI Fill" (paste → values)
  enableReview             // show "Review"
  onSchemaChange={setSchema}
  onSubmit={handleSubmit}
/>
```

### Or wire the pieces yourself
`AIFill` / `AISchemaReview` act on the whole form, so they sit **beside**
`FormGenerator` and feed it via `patch` / your schema state:

```tsx
const [patch, setPatch] = useState({});
<>
  <AIFill client={ai} schema={schema} onFill={setPatch} />
  <FormGenerator guid="f1" data={schema} patch={patch} onSubmit={handleSubmit} />
</>
```

Extraction is **options-aware**: for Select/Radio/Chip fields it's told the valid
option values (and any date/number `format`), so it returns values your controls accept.

## 1. Natural language → form

```tsx
import { AIFormGenerator } from 'dynamic-mui';

<AIFormGenerator client={ai} onGenerate={(fields) => setSchema(fields)} />
// or edit an existing form:
<AIFormGenerator client={ai} current={schema} onGenerate={setSchema} />
```

Or headless: `const fields = await ai.generateForm('a patient intake form with name, DOB, insurance, symptoms');`

## 2. Paste-to-fill (extract into fields)

```tsx
import { AIFill } from 'dynamic-mui';

<AIFill client={ai} schema={schema} onFill={(values) => setPatch(values)} />
```

Headless: `const values = await ai.extractToFields(pastedText, [{ id:'name' }, { id:'email' }]);`

## 3. Field assist (rewrite / summarize / translate)

```tsx
import { AITextAssist } from 'dynamic-mui';

<AITextAssist client={ai} text={value} onResult={setValue} />
// or the hook:
const { run, loading } = useAIAssist(ai);
const improved = await run(value, 'improve');
```

## 4. AI schema review

```tsx
import { AISchemaReview } from 'dynamic-mui';

<AISchemaReview client={ai} schema={schema} onApply={setSchema} />
```

Headless: `const { issues, improved } = await ai.reviewForm(schema);`

## 5. Document / image → form (vision)

Digitize a photo/scan of a paper form into a schema, or read a document
(receipt, invoice, ID) into an existing form's fields. Requires a vision-capable
model (gpt-4o / gpt-4o-mini).

```tsx
import { AIVisionImport } from 'dynamic-mui';

// Build a form from an image of one:
<AIVisionImport client={ai} mode="generate" onGenerate={setSchema} />

// Read a document into the current form:
<AIVisionImport client={ai} mode="fill" schema={schema} onFill={setPatch} />
```

Headless:
```ts
const fields = await ai.generateFormFromImage(dataUrl);
const values = await ai.extractFromImage(dataUrl, [{ id: 'total' }, { id: 'date' }]);
```

> The playground's **Build with AI** button (top bar) demonstrates #1 and #5 live —
> just point it at your proxy endpoint.

## Notes

- Provider-agnostic: the client speaks the OpenAI chat shape, but your proxy can
  target any provider that accepts `{ messages }` and returns
  `{ choices: [{ message: { content } }] }` (or `{ content }` / `{ result }`).
- The mapping layer (`simpleFieldsToFormFields` / `formFieldsToSimple`) converts
  between the LLM's simple field spec and the full `FormField` schema, so model
  output is always renderable.
