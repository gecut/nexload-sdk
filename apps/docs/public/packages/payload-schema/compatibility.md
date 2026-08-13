# Compatibility

Current runtime, peer, test, packaging, and workflow boundaries for Payload Schema.

**Topic:** compatibility
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/compatibility/
The current documented package is `@nexload-sdk/payload-schema` 1.1.0.

| Requirement | Supported |
| --- | --- |
| Node | `>=20.9.0` |
| Payload | `>=3.85.0 <4.0.0` |
| Zod | `>=4.0.0 <5.0.0` |
| Module system | ESM-only |

The package's development manifest currently pins Payload `3.86.0`, Zod `4.4.3`, and matching Payload database/rich-text packages for repository tests.

## Repository evidence

Available package scripts cover unit, type, SQLite, PostgreSQL, packed consumer, and consumer compatibility smoke paths. The helper script is not an active cross-product CI matrix by itself. At the time of this documentation, there is no dedicated active `payload-schema` compatibility workflow in `.github/workflows`; do not interpret the peer range as proof that every version pair runs on every pull request.

Before relying on compatibility automation, inspect the live [manifest](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/package.json), [tests](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-schema/tests), and [workflow directory](https://github.com/gecut/nexload-sdk/tree/main/.github/workflows).

The package is side-effect free and exposes only its root and `package.json`. Deep imports are unsupported. Historical versioned docs are not hosted.
