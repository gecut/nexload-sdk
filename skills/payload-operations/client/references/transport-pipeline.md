# Transport pipeline

## Client plugins

Define plugins through `defineClientPlugin({ name, wrapTransport })` from `@nexload-sdk/payload-operations/client`. Names are unique and composition is right-to-left, making the first configured plugin outermost. Always call `next` once unless the plugin intentionally terminates the request.

Every request carries:
- `source: "payload"` for native SDK calls;
- `source: "operation"` plus operation name/path for custom calls.

Base `RequestInit` is applied before call options. Call headers may override base headers, but operations always set POST, own the body, set JSON content type, and remove `Content-Length`.

## Timeout plugin

Import `timeoutPlugin` from `@nexload-sdk/payload-operations/plugins/timeout`:

```ts
import { timeoutPlugin } from "@nexload-sdk/payload-operations/plugins/timeout";

const plugin = timeoutPlugin({ timeout: 5000 }); // milliseconds
```

The options object takes `{ timeout: number }` (positive finite integer; do not use `{ ms }`).

`timeoutPlugin` combines an existing caller signal with a timeout signal. Only operation timeouts become the package timeout error (`isTimeoutError(error) === true`); caller aborts and native Payload SDK failures pass through unchanged. Custom plugins should preserve request metadata and signal.
