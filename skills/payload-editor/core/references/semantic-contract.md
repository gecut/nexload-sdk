# Semantic contract

`createEditor` requires an explicit built-in/custom preset or `features`. Absence inherits a preset and disables without one. `false` disables; `true` resets to adapter defaults; an object shallow-merges; arrays replace; `null` fails.

Supported option features are heading, link, upload, and relationship. Managed advanced exclusions, upload sub-fields, custom link fields, Blocks, AI, and themes are intentionally absent.

`PayloadEditorConfigError` exposes stable `code`, `path`, and optional `hint`. Do not warn and continue.
