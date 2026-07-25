# Compatibility

Current runtime, peer, entrypoint, and verification boundaries for Payload Operations.

**Topic:** compatibility
**Package:** `@nexload-sdk/payload-operations` v0.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/compatibility/
The current documented package is `@nexload-sdk/payload-operations` 0.1.0.

| Requirement       | Contract                 |
| ----------------- | ------------------------ |
| Node              | `>=20.9.0`               |
| Payload           | `>=3.85.0 <4.0.0`        |
| `@payloadcms/sdk` | `>=3.85.0 <4.0.0`        |
| Zod               | `>=4.0.0 <5.0.0`         |
| Module system     | ESM-only                 |
| Side effects      | package declares `false` |

Keep Payload and its SDK on the same exact version. The development baseline is Payload and SDK 3.86.0 with Zod 4.4.3; supported peer ranges are not a claim that every combination is continuously tested.

## Runtime boundaries

The root, `/contract`, `/client`, `/errors`, and `/plugins/timeout` entrypoints do not import the Payload server runtime. `/server` is Node/Payload-only.

`AbortSignal.timeout` and `AbortSignal.any` are required by the timeout plugin and are available at the minimum Node runtime. Browser consumers need equivalent platform support if they use that plugin.

## Repository evidence

This initial package stage intentionally has no package test suite. Repository checks cover strict typechecking, lint, ESM build artifacts, public export resolution, docs examples, and workspace build compatibility. Runtime and type behavior therefore do not have independent automated test-suite evidence yet.

Historical versioned docs are not hosted. Pin peers, inspect the [manifest](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/package.json), and review the [changelog](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-operations/CHANGELOG.md) before upgrading.
