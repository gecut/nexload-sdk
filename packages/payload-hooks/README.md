# @nexload-sdk/payload-hooks

Small Payload CMS hook helpers built on top of `@nexload-sdk/logger`.

## Install

```bash
pnpm add @nexload-sdk/payload-hooks
```

## Exports

- `logOperation(hookType)`

## Quick Start

```ts
import { logOperation } from "@nexload-sdk/payload-hooks";

export const Posts = {
  slug: "posts",
  hooks: {
    beforeChange: [logOperation("beforeChange")],
    afterChange: [logOperation("afterChange")],
    afterDelete: [logOperation("afterDelete")],
    afterRead: [logOperation("afterRead")]
  }
};
```

## Supported Hook Types

- `beforeChange`
- `afterChange`
- `afterDelete`
- `afterRead`

## Behavior

The returned hook logs the collection slug/name and hook type using `@nexload-sdk/logger`, then returns:

- `args.data` when present
- `args.doc` when present
- `null` otherwise
