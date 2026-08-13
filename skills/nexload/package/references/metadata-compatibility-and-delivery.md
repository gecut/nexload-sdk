# Metadata, compatibility, and delivery

## Dependency ownership

- Put libraries required by the shipped runtime in `dependencies` unless they are intentionally bundled.
- Put build/test-only tools in `devDependencies`.
- Use `peerDependencies` when consumers must share a compatible host or plugin runtime such as React or Payload. Declare the widest range supported by recorded compatibility evidence and install peers for development tests as needed.
- Verify classification against the packed artifact; do not apply labels mechanically.

## Manifest truth

Review `exports`, `files`, `types`, `main`/`module`, `engines`, `sideEffects`, dependencies, peers, and publish configuration together. `sideEffects: false` is a tree-shaking promise: omit it or enumerate exceptions when entrypoints import CSS, register hooks, polyfill globals, or mutate state at import time.

`engines` should describe the tested support matrix, not the developer's current machine. Do not claim a runtime or module lane that CI or a recorded compatibility smoke does not exercise.

## Delivery proof

Use a clean directory or fixture consumer to:

1. build the package;
2. create/inspect the tarball;
3. install it without workspace resolution;
4. import each documented entrypoint;
5. exercise representative runtime behavior and public types.

A dry-run listing catches missing files; an installed consumer catches resolution, externalization, declaration, and peer problems.

## Documentation and release

README examples must use real exports and state runtime/subpath constraints. Update docs with behavior changes. Determine SemVer from the currently declared public API; do not edit versions, changelogs, Changesets, or publish unless the task requests it.

## Primary sources

- npm, [`package.json`](https://docs.npmjs.com/cli/configuring-npm/package-json/)
- Semantic Versioning, [SemVer 2.0.0](https://semver.org/)
- esbuild, [Ignore annotations](https://esbuild.github.io/api/#ignore-annotations)
