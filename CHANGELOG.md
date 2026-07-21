# Changelog

All notable changes to **dynamic-mui** are documented here.

## [2.4.0] - 2026-07-21

### Added

- **MUI X Community / Pro / Premium support** — `configureMuiX({ ... })` lets you
  inject your tier's components (e.g. `DataGridPro`/`DataGridPremium`, `BarChartPro`,
  pro pickers) so the `datatable`, chart, and date-picker controls render them.
  Anything not overridden falls back to the free Community version — so
  dynamic-mui now works cleanly whether an app uses Community, Pro, or Premium.
  Exported: `configureMuiX`, `getMuiX`, `resetMuiX`, and the `MuiXOverrides` type.

## [2.3.1] - 2026-07-21

### Fixed

- **Date/time pickers crashed with `value.isUTC is not a function`** when the
  consumer's `@mui/x-date-pickers` was a different `dayjs` instance than the one
  bundled by this library. `dayjs` is now an externalized **peer** (shared with
  the picker adapter) and the pickers load the `utc`/`timezone` plugins, so the
  adapter's timezone helpers work. Consumers using date controls should have
  `dayjs` installed (they already do transitively via `@mui/x-date-pickers`).
- The generic control error-boundary message no longer blames charts/data-grids
  for every field failure — it now reads "This field couldn't be displayed…".

## [2.3.0] - 2026-07-21

A large, fully **backward-compatible** release: extensibility, a headless engine,
i18n, UX/output features, a big production-hardening pass, and a much smaller
package. Every existing form, schema, prop and control keeps working unchanged —
all additions are new optional props/exports.

### Added — Extensibility & DX

- **Custom controls** — `registerControl(type, Component)` (+ `registerControls`,
  `unregisterControl`, …). Your component gets the same `ControlProps` as
  built-ins and participates fully in the engine; a registered type overrides the
  built-in of the same name.
- **Zod / Yup validation** — `resolver={zodResolver(schema)}` / `yupResolver`.
  Validates the whole form; errors merge with per-field rules. `zod`/`yup` are
  never imported/bundled (the resolvers duck-type the schema object you pass).
- **Async / remote validation** — `asyncValidators={{ id: fn }}` runs debounced,
  race-safe server checks with a pending/valid/invalid indicator; gates submit.
- **Typed values** — `FormApi<T>`, `FormData<T>(guid)`, `useForm<T>(guid)` are
  generic for autocompleted, type-checked values.
- **Headless engine** — `useFormEngine(schema)` drives the whole dynamic engine
  (rules/validation/dynamic options/subforms) with **no UI**; render your own
  components off `visibleFields` + `setValue`.
- **Schema linter** — `validateSchema(schema)` returns `SchemaIssue[]` (duplicate
  ids, `dependsOn`→missing field, orphan `optionsMap`, rule refs to unknown
  fields, subform conditions that aren't real options).
- **Internationalisation** — a `translate` prop localizes every user-facing
  string (labels, placeholders, helper text, option labels, validation messages,
  typography, submit/cancel labels): `translate={(s) => dictionary[s] ?? s}`.

### Added — UX & output

- **Read-only & review mode** — `readOnly`; `reviewMode` renders a clean
  label → value summary (resolves option labels, Yes/No, multi-values; skips
  hidden/display-only; follows matching subforms).
- **Print & PDF** — `apiRef.print({ title })` (dependency-free) and
  `apiRef.exportPdf({ title, filename })` via the optional lazy `pdfmake` peer.
- **Dirty tracking & unsaved guard** — `apiRef.isDirty()`, `getInitialValues()`,
  `resetToInitial()`, `markPristine()`, and a `warnOnUnsavedChanges` prop.
- **Configurable submit bar** — `submitButton` (`label`, `color`/`gradient`,
  `icon`/`endIcon`, `variant`, `loading`/`loadingLabel`, `fullWidth`, `sx`),
  `stickySubmit`, `cancelLabel`/`onCancel`; auto-loader on an async `onSubmit`.
- **Wizard step validation** — `validateSteps` on `formwizard` gates Next/Finish.

### Changed — packaging & performance (smaller, leaner)

- **MUI X and the AWS SDK are no longer bundled** — externalized and declared as
  peers (`@mui/x-charts`, `@mui/x-data-grid`, `@aws-sdk/*` are OPTIONAL peers).
  Peer ranges now include MUI X **v8**. Packed size dropped from ~3.2 MB to
  ~0.3 MB.
- **Controls are code-split** — heavy/less-common controls (charts, data grid,
  signature, rich text, editors, …) lazy-load on demand and stay out of the
  initial bundle; common primitives remain eager (no flicker).
- **ESM/CJS entries** are now `.mjs`/`.cjs` (no `MODULE_TYPELESS` warning; works
  on older Node). Internal `.d.ts` (test/theme/main) are no longer published.
- `lodash` imported per-method for better tree-shaking.

### Fixed — production-hardening pass (adversarial review)

- **Validators are crash-safe** — every rule coerces non-string input and can no
  longer throw (a `numeric`/`email`/… rule against a number/boolean/undefined no
  longer crashes the render). All 60 control types verified to render on minimal
  props without crashing.
- **DataTable** no longer crashes with sparse props (defaults `rows`/`columns`).
- **Controlled/uncontrolled fixes** — Select/Autocomplete/Radio never resolve to
  `undefined`; NumberField now syncs an external value change.
- **FormRepeater** groups beyond 20 no longer share one store id (data collision).
- **Subforms** — each branch has its own store and remounts on switch, so a
  previous branch's values no longer re-appear in the UI while the store is empty.
- `reset()`/`resetToInitial()` remount controls; review → edit preserves typed
  data; async-validation timers and async-submit loaders are cleaned up on
  unmount; a restored auto-save draft is no longer falsely "dirty".
- `exportPdf` lazy `pdfmake` import resolves under bundlers; `uploadToS3` guards a
  bad data URL and gives a clear "install @aws-sdk" message; the AI client guards
  a non-JSON proxy response; `eq`/`neq` no longer collapse distinct objects; the
  Builder palette tiles no longer jitter at a viewport edge.

### Quality

- Accessibility tests (`jest-axe`) on the core controls + RTL; a 60-control
  crash-safety sweep; the headless engine, resolvers, schema linter, i18n, async
  validation, and dirty-tracking each covered by tests.

## [2.2.0] - 2026-07-20

Backward-compatible feature release. Existing schemas, `FormData(guid)` /
`ClearFormData(guid)`, and every control keep working unchanged.

### Added

- **5 new controls**
  - `asyncautocomplete` — Autocomplete whose options are fetched on demand (debounced, loading state).
  - `editabletable` — inline-editable data grid with add/remove rows.
  - `intlphone` — international phone input with country selector and validation.
  - `nps` — Net Promoter Score (0–10) selector.
  - `richtext` — rich text editor producing HTML.
- **Typed schema helper** — `defineForm(schema)` gives full TypeScript
  autocompletion and compile-time checking for your form definition. Exported
  alongside the field/rule types from the package root.
- **Imperative API** via `apiRef` — a `FormApi` handle exposing
  `getValues()`, `setValues(values)`, `getErrors()`, `validate()`, `reset()`,
  and `submit()` so a parent can drive the form programmatically.
- **Internationalisation** — a `messages` prop (`FormMessages`) to localise the
  built-in copy (e.g. the required-field message and the error summary).
- **Validation summary** — opt-in `validationSummary` renders an accessible
  (`role="alert"`, `aria-live`) summary above the form after a failed submit,
  and focus moves to the first invalid field.
- **Per-option colour for Radio** — each entry in `MuiFCLabels` may carry a
  `color` (and optional `sx`) to tint that option's dot and label independently.

### Changed / Improved

- **Date & time pickers now match the fields around them.** `DateTime`,
  `TimePicker`, `DateTimePicker`, and `DateRangePicker` inherit the ambient
  theme's `MuiTextField` `size`/`variant`. Previously a picker (which renders a
  `MuiPickersTextField`, not a `MuiTextField`) ignored those defaults and could
  render a different height than its neighbours.
- **Premium input styling now covers the pickers.** The shared outlined-input
  styling also targets `.MuiPickersOutlinedInput-root` (MUI X v7+ accessible
  field), so pickers get the same radius, background, border, and focus ring as
  text fields.
- Pickers now **merge** consumer-supplied `slotProps` instead of overwriting the
  control's own defaults.

### Fixed

- Hardened rule/validation edge cases surfaced by an adversarial test pass
  (non-array `nin`, whitespace-only mandatory values, non-numeric guards,
  boolean/null coercion, cross-field checks on empty optional fields, dynamic
  `dependsOn`/`optionsMap` option pruning, and stale computed values).
- Schema-provided initial values (`props.value`) and `patch` values are now
  seeded into the store on first render, so conditional fields, subforms, and
  `requiredWhen` all evaluate correctly on the **initial** form — not only after
  the first change.

## [2.1.0] - 2026

- Dynamic rule engine (`visibleWhen` / `disabledWhen` / `requiredWhen` /
  `formula` / cross-field validation / dynamic options / subforms), 24 new
  controls, AI module, and assorted fixes.

## [2.0.x]

- Visual builder, documentation mode, validation indicators, and the core
  control library.

[2.2.0]: https://github.com/DinakaranS/dynamic-mui/releases/tag/v2.2.0
[2.1.0]: https://github.com/DinakaranS/dynamic-mui/releases/tag/v2.1.0
