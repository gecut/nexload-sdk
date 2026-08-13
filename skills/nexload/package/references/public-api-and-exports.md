# Public API and exports

## Public API budget

Every exported value, type, subpath, behavior, and persisted shape consumes compatibility budget. Export a capability because consumers need a supported contract, not because an internal helper may be useful later.

Keep the root focused on the primary consumer path. Add a subpath when a capability has an independent runtime, dependency, or conceptual identity. Prefer names such as `./client`, `./server`, or `./admin/field` over internal folder names.

## Alignment gate

For every public entrypoint, verify all layers agree:

1. `package.json` export condition and type target;
2. source entrypoint;
3. bundler entry/output;
4. emitted JavaScript and declaration;
5. publish `files` inclusion;
6. README example;
7. clean consumer import.

An export map that points to an unbuilt file is not a partial success. A built file absent from the tarball is not shipped.

## Barrels and types

- Use `src/index.ts` primarily as a deliberate boundary. Tiny single-entry packages may contain implementation when separation adds no clarity.
- Direct internal imports preserve dependency direction; avoid routing private modules through the package's own public barrel.
- `export *` is acceptable when the entire source module is intentionally public and collision/compatibility consequences are checked.
- Public third-party types are acceptable when interoperability is the purpose. Otherwise expose package-owned contracts and keep implementation types private.
- Generics should preserve useful inference, not decorate the API.

## Compatibility

Adding `exports` to an already published package can hide consumer deep imports and therefore requires a compatibility audit. Review source, type, runtime, entrypoint, and persisted-data compatibility separately. Internal reorganization should not break supported imports.

## Primary source

- Node.js, [Package entry points](https://nodejs.org/api/packages.html#package-entry-points)
