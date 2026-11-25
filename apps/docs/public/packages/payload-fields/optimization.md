# payload-fields — Optimization

Production choices for @nexload-sdk/payload-fields.

**Topic:** optimization
**Package:** `@nexload-sdk/payload-fields` v4.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-fields/optimization/
## Normalize strings before field hooks

Install payloadFieldsPlugin() when REST or Local API callers send money values as strings. It normalizes Persian digits and separators before Payload parses number fields.

## Send integers from numeric clients

Pass minor-unit integers when the client already owns numeric conversion.

## Handle nested slug uniqueness

Automatic collision suffixes apply only to top-level slugs. For slugs inside arrays, groups, or named tabs, use `unique: false` to avoid relying on suffixing.

## Order field plugins deliberately

The plugin sees collections and globals present when it runs. Place plugins adding money fields before it, respecting its order of 900.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/payload-fields/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/payload-fields/core/SKILL.md).
