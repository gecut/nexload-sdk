# Browser boundary failure

Review whether the new browser entrypoint is production-ready.

Requirement: expose a browser-safe token formatter without server access.

Evidence:

- `./browser` re-exports `formatToken` from the package root.
- The root imports `loadSigningSecret` from `node:fs` and reads `JWT_SECRET` during module initialization.
- `formatToken` itself is pure, but importing `./browser` executes the root module.
- The package declares the browser subpath as supported and documents use in a client component.
- Typecheck and the Node package build pass; no browser-bundle or clean browser-import smoke was run.
