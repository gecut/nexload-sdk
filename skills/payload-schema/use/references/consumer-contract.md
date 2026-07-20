# Consumer contract

The entity owns intrinsic field type, constraints, same-type normalization, nullability, and static default validation. Payload owns required presence, persistence, collection hooks, access, drafts, localization, layout, and generated document types. Application schemas own cross-field and use-case rules.

`entity.schema` may return any Zod schema. `pick` is strict and required by default; optional changes property presence only. Canonical field schemas must be synchronous, while arbitrary derived schemas may be async.

Static `defaultValue` is parsed once during `defineEntity` and forwarded to Payload. `dynamicDefaultValue` is forwarded as a native function. Do not set both or use `payload.defaultValue`.
