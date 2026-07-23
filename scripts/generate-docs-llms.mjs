// Backwards-compatible workspace entrypoint. The implementation lives beside
// the docs app so its Markdown dependencies resolve from the owning package.
await import("../apps/docs/scripts/generate-markdown.mjs");
