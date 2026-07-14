---
name: payload-fields-slug
description: Use when adding or reviewing managed Unicode slug fields, slug synchronization, slug locks, localization, dot-path sources, or registered server-side slug generators.
---

# Managed Slugs

Use `slugField({ source, name, lockName, generator })`.

- Keep lock state localized exactly when the slug is localized.
- Let `formatSlug` remain the final normalization authority.
- Regenerate only for locked slugs whose source changed and is non-empty.
- Never clear an existing locked slug just because its source becomes empty.
- Register generators with `payloadFieldsPlugin`; never pass callbacks to Admin client props.
