# Healthcheck Bun compatibility

Bun runtime and module boundaries.

**Topic:** compatibility
**Package:** `@nexload-sdk/healthcheck-bun` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/bun/compatibility/
The package targets Bun-compatible globals and depends on current core. Optional server counters follow the `BunServerLike` contract and may be absent.

It publishes ESM, CommonJS, and declarations. There is no package-local test script in the current manifest, so compatibility is based on source contracts and workspace build/lint—not an asserted multi-version Bun matrix.

No minimum or currently verified Bun version is declared. Use the Bun version
pinned by your application and run the Quick start under that exact runtime
before adopting the integration.
