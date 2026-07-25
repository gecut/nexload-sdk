# Transport pipeline

Define plugins through `defineClientPlugin({ name, wrapTransport })`. Names are unique and composition is right-to-left, making the first configured plugin outermost. Always call `next` once unless the plugin intentionally terminates the request.

Every request carries:

- `source: "payload"` for native SDK calls;
- `source: "operation"` plus operation name/path for custom calls.

Base `RequestInit` is applied before call options. Call headers may override base headers, but operations always set POST, own the body, set JSON content type, and remove `Content-Length`.

`timeoutPlugin` accepts a positive finite integer. It combines an existing signal with a timeout signal. Only operation timeouts become the package timeout error; caller aborts and native Payload SDK failures pass through unchanged. Custom plugins should preserve request metadata and signal.
