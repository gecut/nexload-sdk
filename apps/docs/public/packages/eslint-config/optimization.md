# eslint-config — Optimization

Production choices for @nexload-sdk/eslint-config.

**Topic:** optimization
**Package:** `@nexload-sdk/eslint-config` v9.39.2
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/eslint-config/optimization/
## Choose the runtime preset

Use nexloadConfig with the options for the project runtime. Compose exported presets when explicit ordering is needed.

## Keep type-aware linting enabled

Use the shared base rules for type-aware checks and inline type imports.

## Use project service for typed rules

The base configuration uses TypeScript project service for type-aware linting. Ensure the project has a suitable TypeScript configuration.

## Compose overrides after the preset

Pass custom rules or ignores as additional arguments to `nexloadConfig`, or compose the exported preset arrays in the order needed.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/tools/eslint-config/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/tools/eslint-config/src/index.ts).
