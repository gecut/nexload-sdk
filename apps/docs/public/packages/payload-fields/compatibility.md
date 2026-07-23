# Compatibility

Current runtime, peer, packaging, and test boundaries for Payload Fields.

**Topic:** compatibility
**Package:** `@nexload-sdk/payload-fields` v3.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/compatibility/
The current documented package is `@nexload-sdk/payload-fields` 3.1.0.

| Dependency | Supported range |
| --- | --- |
| Payload | `>=3.68.5 <4` |
| `@payloadcms/ui` | `>=3.68.5 <4` |
| React | `^19.0.1`, `^19.1.2`, or `^19.2.1` |
| React DOM | same supported range as React |

Match Payload and every `@payloadcms/*` package exactly. Match React and React DOM exactly within your application's chosen release.

The package publishes ESM and CommonJS root and semantic subpaths. Admin subpaths are public for Payload's Import Map. `react-day-picker` is a package dependency.

## What repository checks prove

The package exposes `build`, `lint`, and Node test scripts. Those checks cover the package's tested development versions and contracts; they are not a promise that every point inside each peer range is exercised in an active cross-product workflow.

Check the live [manifest](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/package.json) and [workflow directory](https://github.com/gecut/nexload-sdk/tree/main/.github/workflows) before treating a compatibility statement as CI evidence.

Historical versioned documentation is not hosted here. Pin production dependencies and consult release history before upgrades.
