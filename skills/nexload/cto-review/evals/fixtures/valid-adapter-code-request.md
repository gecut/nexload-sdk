# Valid abstraction with implementation request

CTO-review this storage package, then give me the corrected interface and patch.

Requirement: the same persistence policy must run against two current backends, Redis and an in-memory test/runtime adapter.

Evidence:

- A small `StorageAdapter` boundary contains only `get`, `set`, and `delete`, which both current backends implement.
- Expiration policy and key normalization live once in the package core.
- Adapters own backend clients but no business policy.
- Consumers create independent storage instances and own disposal.
- Only the capability and the two deliberate adapter subpaths are public.
- Focused policy tests and both adapter integration lanes pass.
