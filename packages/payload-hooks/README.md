# @nexload-sdk/payload-hooks

<div align="center">
  <img src="https://img.shields.io/badge/payload--cms-hooks-brightgreen?style=flat-square" alt="payload cms hooks" />
  <img src="https://img.shields.io/badge/types-typescript-blue?style=flat-square" alt="typescript" />
  <img src="https://img.shields.io/npm/v/@nexload-sdk/payload-hooks?style=flat-square" alt="npm version" />
  <br><br>
  <strong>Effortless, type-safe logging for Payload CMS collection operations.</strong>
</div>

---

## Features
- 🚀 **Declarative Logging:** Easily add logging to any collection hook (`beforeChange`, `afterChange`, `afterDelete`, `afterRead`).
- 🛡️ **Type-Safe:** Fully typed to ensure compatibility with Payload's hook system.
- 🔎 **Structured Logs:** Captures the collection name and the type of operation being performed.
- 🧩 **Composable:** A simple utility that enhances your Payload CMS collections without adding complexity.
- 🌐 **Integrated:** Works seamlessly with `@nexload-sdk/logger` for consistent, high-performance logging.

---

## Installation
```bash
pnpm add @nexload-sdk/payload-hooks
# or
yarn add @nexload-sdk/payload-hooks
# or
npm install @nexload-sdk/payload-hooks
```

---

## Quick Start

### Basic Usage
Simply import `logOperation` and add it to the hooks of your collection.

```typescript
import { logOperation } from '@nexload-sdk/payload-hooks';
import type { CollectionConfig } from 'payload/types';

export const MyCollection: CollectionConfig = {
  slug: 'my-collection',
  hooks: {
    beforeChange: [logOperation('beforeChange')],
    afterChange: [logOperation('afterChange')],
    afterDelete: [logOperation('afterDelete')],
    afterRead: [logOperation('afterRead')],
  },
  fields: [
    // ... your fields
  ],
};
```

---

## API Reference

### `logOperation(hookType)`
- A factory function that returns a Payload CMS hook.
- Parameters:
  - `hookType: 'beforeChange' | 'afterChange' | 'afterDelete' | 'afterRead'`
- Returns: A hook function that can be used in a collection's hooks array.

---

## How It Works
The `logOperation` function is a higher-order function that takes a `hookType` and returns a hook function that logs the operation to the console using `@nexload-sdk/logger`. It automatically extracts the collection slug and includes it in the log output, providing clear and concise information about what's happening in your application.

---

## Contributing
1. Fork this repo, create a feature branch (`feat/name`)
2. Make your changes — ensure all types, tests, and lint pass
3. Use commit messages of the format: `feat(scope): your description`
4. Open a pull request (PR) — BugBot checks and feedback required

---

## License

MIT © GecutWeb Contributors

---

## Branding

Built by [NexLoad SDK](https://github.com/gecut/nexload-sdk) · Enabling modern, observable, and resilient applications with top-notch developer tools.
