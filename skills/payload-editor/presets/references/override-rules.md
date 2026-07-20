# Override rules

Merge order is preset, consumer overrides, canonical adapter resolution, native append, validation, then Payload.

Absent values inherit; `false` disables; `true` discards preset options and uses adapter defaults. Option objects shallow-merge. Arrays such as heading sizes and collection allowlists replace. Caller object insertion order is irrelevant.
