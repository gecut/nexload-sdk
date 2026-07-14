---
name: payload-fields-core
description: Use when configuring or reviewing @nexload-sdk/payload-fields semantic factories, protected overrides, Payload Import Map exports, localization, or server-client boundaries.
---

# Nexload Payload Fields Core

Use options-object factories only. Do not use positional field APIs.

- Keep `type`, semantic `name`, required Admin components, and `custom.nexload` package-owned.
- Preserve compatible consumer hooks, Admin slots, and custom metadata.
- Keep callbacks and generator implementations on the server; only keys and display options reach Admin client props.
- Use Admin component subpaths only through factory-generated field definitions.
