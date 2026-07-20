export { FormGenerator, FormData, ClearFormData, useForm } from './components/FormGenerator';
export type { FormApi, FormMessages, FormGeneratorProps } from './components/FormGenerator';
export { default as DynamicComponent } from './components/DynamicComponent';
export { default as Controls } from './components/controls';
export { default as MuiConfig } from './config/mui';
export * from './types';

// AI: form generation, paste-to-fill, field assist, schema review.
// The OpenAI key stays server-side — see src/ai/README.md + examples/openai-proxy.js.
export * from './ai';

// Typed authoring layer: compile-time-checked form schemas via `defineForm`.
export * from './schema';
