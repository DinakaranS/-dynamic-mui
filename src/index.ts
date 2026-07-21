export { FormGenerator, FormData, ClearFormData, useForm } from './components/FormGenerator';
export type { FormApi, FormMessages, FormGeneratorProps, SubmitButtonConfig, AsyncValidator } from './components/FormGenerator';
export { default as DynamicComponent } from './components/DynamicComponent';
export { default as Controls } from './components/controls';
export { default as MuiConfig } from './config/mui';
export {
    registerControl,
    registerControls,
    unregisterControl,
    getRegisteredControl,
    hasRegisteredControl,
    registeredControlTypes,
} from './util/registry';
export type { ControlComponent } from './util/registry';
export { zodResolver, yupResolver } from './util/resolvers';
export type { FormResolver, FieldError } from './util/resolvers';
export { useFormEngine } from './util/useFormEngine';
export type { FormEngine, FieldState, UseFormEngineOptions } from './util/useFormEngine';
export { validateSchema } from './util/validateSchema';
export type { SchemaIssue } from './util/validateSchema';
export * from './types';

// AI: form generation, paste-to-fill, field assist, schema review.
// The OpenAI key stays server-side — see src/ai/README.md + examples/openai-proxy.js.
export * from './ai';

// Typed authoring layer: compile-time-checked form schemas via `defineForm`.
export * from './schema';
