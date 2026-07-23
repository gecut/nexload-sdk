# Troubleshooting

Diagnose Payload Editor definitions, presets, options, extensions, and peer mismatch.

**Topic:** troubleshooting
**Package:** `@nexload-sdk/payload-editor` v1.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-editor/troubleshooting/
## Config says a definition is required

`createEditor({})` is intentionally invalid. Supply `preset` or `features`; there is no hidden default.

## An override did not inherit as expected

Remember the merge model: objects shallow-merge, arrays replace, `false` disables, and `true` resets to adapter defaults. Inspect the exact feature path named by `PayloadEditorConfigError`.

## Duplicate feature

A native extension has the same provider key as a managed or earlier extension. Disable the managed feature before adding its replacement, and include each native provider once.

## Invalid relationship or upload options

Collection lists must be valid arrays of non-empty slugs. `maxDepth` must satisfy the package validator. These settings do not grant read access; configure Payload access separately.

## Unknown preset or lookalike custom preset

Use one of the five built-in names or the exact object returned by `defineEditorPreset`. Serialized or spread copies lose their registered identity.

## Type incompatibility from Lexical

Verify exact version alignment between `payload` and every `@payloadcms/*` package. The supported range does not make mismatched Payload packages safe.

Configuration errors are developer errors. Fix them during boot or tests rather than catching them and continuing with a partial editor.
