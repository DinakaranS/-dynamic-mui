export { FormGenerator, FormData, ClearFormData } from './components/FormGenerator';
export { default as DynamicComponent } from './components/DynamicComponent';
export { default as Controls } from './components/controls';
export { default as MuiConfig } from './config/mui';
export * from './types';

// AI: form generation, paste-to-fill, field assist, schema review.
// The OpenAI key stays server-side — see src/ai/README.md + examples/openai-proxy.js.
export * from './ai';
