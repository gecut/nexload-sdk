# Package boundaries

Inspect `package.json` before using an entrypoint. Public subpaths are:

| Subpath | Contents | Target / Runtime | Runtime Dependencies |
|---|---|---|---|
| `@nexload-sdk/payload-operations` (root) | `operation`, `defineCMSOperations`, `safe`, `isDefinedError`, `isTimeoutError`, and types | Universal | `zod` (no `payload`, no `@payloadcms/sdk`) |
| `@nexload-sdk/payload-operations/contract` | `operation`, `defineCMSOperations`, and contract types | Universal | `zod` |
| `@nexload-sdk/payload-operations/errors` | `safe`, `isDefinedError`, `CMSOperationError`, `isCMSOperationError`, and types | Universal | None |
| `@nexload-sdk/payload-operations/client` | `createOperationsClient`, `defineClientPlugin`, transport types | Universal | `zod` (peer; no `@payloadcms/sdk`) |
| `@nexload-sdk/payload-operations/cms` | `createCMSClient`, `createPayloadFetchAdapter`, CMS client types | Universal | `@payloadcms/sdk` (optional peer) + `zod` |
| `@nexload-sdk/payload-operations/plugins/timeout` | `timeoutPlugin`, `isTimeoutError`, `TimeoutPluginOptions` | Universal | None |
| `@nexload-sdk/payload-operations/server` | `createPayloadEndpoints`, `CMSOperationError`, `DEFAULT_MAX_BODY_BYTES`, server types | Node / Payload Server only | `payload` + `zod` |

Never deep-import `src`, `dist` internals, symbols, traversal helpers, or response parsers.

The universal root, `./contract`, `./errors`, `./client`, and `./plugins/timeout` are pure and browser-bundle-safe; they do not load Payload server runtime or `@payloadcms/sdk`.

## Peer dependencies

- `zod`: `>=4.1.0 <5.0.0` (required for codec methods `z.encodeAsync` and `z.decodeAsync`).
- `payload`: `>=3.85.0 <4.0.0` (peer dependency for `./server`).
- `@payloadcms/sdk`: `>=3.85.0 <4.0.0` (optional peer dependency, required only for `./cms`).

Verify declarations and declaration maps, source maps, ESM resolution, external peers, subpath imports, and a packed consumer when packaging changes.
