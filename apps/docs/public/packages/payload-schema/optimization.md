# payload-schema — Optimization

Production choices for @nexload-sdk/payload-schema.

**Topic:** optimization
**Package:** `@nexload-sdk/payload-schema` v2.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-schema/optimization/
## Choose optionality for projections

A plain pick(keys) makes all picked keys required. Set the optional option when the projection should respect optional fields.

## Preserve block metadata

Reserve id, blockName and blockType in block definitions. Reusing those names throws INVALID\_FIELD\_CONFIGURATION.

## Keep server code out of client bundles

Use the universal root entry for shared schemas. Import the `./payload` compiler only in Node.js Payload configuration.

## Choose codec-safe transformations

Custom schema transforms are not codec-safe for `z.encode`. Use `.refine()` or `.overwrite()` when schemas serve as operation outputs.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-schema/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-schema/use/SKILL.md).
