# Architecture invariants

Field factories expose only kind, schema, and Payload type branding. Private symbol state carries normalized compiler inputs. `defineEntity` binds field paths and relationship ID defaults into closure-owned immutable state.

Compilation clones arrays and plain objects by descriptor. Opaque non-plain objects and functions remain references. Compiler-owned keys cannot arrive through payload extras. One field definition compiles to one field.

Canonical adapters are appended after consumer `beforeValidate` hooks. Undefined bypasses parse. Runtime data issues become Payload `ValidationError`; configuration failures use `PayloadSchemaError`.
