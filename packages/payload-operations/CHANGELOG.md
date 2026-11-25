# @nexload-sdk/payload-operations

## 2.0.0

### Major Changes

- 0f84db8: ### Breaking Changes
  - `createCMSClient` moved to `@nexload-sdk/payload-operations/cms` (removed from root and `./client`).
  - `timeoutPlugin` moved to `@nexload-sdk/payload-operations/plugins/timeout` (no longer exported from root).
  - `createOperationsClient` is public in `@nexload-sdk/payload-operations/client` for standalone RPC without `@payloadcms/sdk`.
  - Client sends caller's original input (`z.input`) over the wire; transforms and defaults execute once on the server.
  - `access.default` is required in `createPayloadEndpoints` (missing default throws `TypeError` at config time).
  - Handler return type is `z.output<output>` and is encoded via `z.encodeAsync` (unrecognized keys are dropped).
  - Output and defined error-data schemas must be codec-safe (unidirectional `.transform()` is not supported; use `z.codec`).
  - Zod peer dependency floor raised to `>=4.1.0 <5.0.0`.
  - `@payloadcms/sdk` is now an optional peer dependency (only required when using `./cms`).
  - Request bodies over 1 MiB (`maxBodyBytes`, default `1_048_576`) are rejected with HTTP 413 `PAYLOAD_TOO_LARGE`.

  ### New
  - Standalone RPC client via `createOperationsClient` from `@nexload-sdk/payload-operations/client` with zero `@payloadcms/sdk` dependency.
  - Symmetrical codec wire model with `z.encodeAsync` / `z.decodeAsync` dropping unmodeled keys.
  - Bidirectional `Date` support using `z.codec`.
  - Built-in `maxBodyBytes` request body size limiting (default 1 MiB) with HTTP 413 responses.
  - Enforced access control requiring `access.default` at configuration time.

  For detailed migration instructions and examples, see the [Migrating to 2.0](https://gecut.github.io/nexload-sdk/packages/payload-operations/guides/) guide.

## 1.0.0

### Major Changes

- 783e1e4: publish

## 0.2.0

### Minor Changes

- abe627e: publish

## 0.1.0

Initial release.

- Define recursive Zod operation contracts with typed domain errors.
- Create Payload POST and CORS preflight endpoints with typed handlers and access policies.
- Create a client that combines native `PayloadSDK` access with matching operation methods.
- Compose client transport plugins and classify operation timeouts.
- Validate inputs, outputs, and error envelopes at asynchronous runtime boundaries.
