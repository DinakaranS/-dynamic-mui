# Changelog

All notable changes to **dynamic-mui** are documented here. This project follows
[Semantic Versioning](https://semver.org/).

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
