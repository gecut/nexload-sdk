# payload-preset — Optimization

Production choices for @nexload-sdk/payload-preset.

**Topic:** optimization
**Package:** `@nexload-sdk/payload-preset` v0.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-preset/optimization/
## Initialize logging first

Call configureLogger() before buildConfig(). Supply a destination when Payload should use the configured output stream.

## Choose plugin ownership

Disable a preset option when the project registers the corresponding plugin itself.

## Keep read auditing deliberate

Audit read logging is off by default. The preset changes top-level configuration and does not mutate collection field definitions.

## Run in Payload configuration

This ESM-only package targets Node.js and Payload configuration. After forced logger reconfiguration, rebuild the Payload configuration.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-preset/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-preset/SKILL.md).
