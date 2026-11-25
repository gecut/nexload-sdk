# Installation and compatibility

Package managers, module formats, and peer dependencies.

**Topic:** documentation
**Canonical page:** https://gecut.github.io/nexload-sdk/start/installation/
## Package managers

Install packages with pnpm, npm, yarn, or Bun. Install required peers in your application; optional peers are needed only for the integration that uses them.

## Module formats and peer dependencies

This matrix reads package manifests. ESM-only packages require an ESM-compatible project; packages listing both formats expose a CommonJS entry as well. Check individual subpath exports for their runtime constraints.

| Package | Module format | Peer dependencies |
| --- | --- | --- |
| @nexload-sdk/logger | ESM and CJS | None |
| @nexload-sdk/persian | ESM and CJS | `zod >=4.1.0 <5.0.0` (optional) |
| @nexload-sdk/healthcheck | ESM and CJS | None |
| @nexload-sdk/healthcheck-node | ESM and CJS | None |
| @nexload-sdk/healthcheck-bun | ESM and CJS | None |
| @nexload-sdk/healthcheck-next | ESM and CJS | None |
| @nexload-sdk/healthcheck-prometheus | ESM and CJS | None |
| @nexload-sdk/healthcheck-otel | ESM and CJS | None |
| @nexload-sdk/healthcheck-payload | ESM and CJS | `payload >=3` (optional) |
| @nexload-sdk/payload-fields | ESM only | `@nexload-sdk/payload-schema >=3.0.0` (optional), `@payloadcms/ui >=3.85.0 <4.0.0`, `payload >=3.85.0 <4.0.0`, `react ^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1`, `react-dom ^19.0.1 \|\| ^19.1.2 \|\| ^19.2.1`, `zod >=4.1.0 <5.0.0` (optional) |
| @nexload-sdk/payload-hooks | ESM and CJS | `payload >=3.85.0 <4.0.0` |
| @nexload-sdk/payload-preset | ESM only | `payload >=3.85.0 <4.0.0`, `@payloadcms/translations >=3.85.0 <4.0.0` |
| @nexload-sdk/payload-editor | ESM only | `@payloadcms/richtext-lexical >=3.68.5 <4`, `payload >=3.68.5 <4` |
| @nexload-sdk/payload-schema | ESM only | `payload >=3.85.0 <4.0.0`, `zod >=4.1.0 <5.0.0` |
| @nexload-sdk/payload-operations | ESM only | `@payloadcms/sdk >=3.85.0 <4.0.0` (optional), `payload >=3.85.0 <4.0.0`, `zod >=4.1.0 <5.0.0` |
| @nexload-sdk/typescript-config | See package exports | None |
| @nexload-sdk/eslint-config | ESM only | `eslint ^9.39.2` |
