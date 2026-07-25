# Package boundaries

Inspect `package.json` before using an entrypoint. Expected public surfaces include the universal root plus `contract`, `client`, `errors`, `plugins/timeout`, and the Payload-only `server` subpath. Never deep-import `src`, `dist` internals, symbols, traversal helpers, or response parsers.

The universal root must remain browser-bundle-safe and must not load Payload server runtime. The server subpath may import Payload runtime helpers. Payload, Payload SDK, and Zod are peers; confirm the live ranges and exact installed family versions rather than copying a version from this reference.

Verify declarations and declaration maps, source maps, ESM resolution, external peers, subpath imports, and a packed consumer when packaging changes. Publishing and release metadata require separate authorization.
