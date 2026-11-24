# Overview & Quick Start

Compose Payload configuration with Nexload defaults.

**Topic:** overview
**Package:** `@nexload-sdk/payload-preset` v0.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-preset/
**Package:** `@nexload-sdk/payload-preset`

**Current released version:** `0.0.0`

[npm](https://www.npmjs.com/package/@nexload-sdk/payload-preset) · [Source](https://github.com/gecut/nexload-sdk/tree/main/packages/payload-preset)

`nexloadPreset()` composes Persian admin defaults, the SDK logger bridge, field hooks, and collection audit logging. It is ESM only and runs in Node.js Payload configuration.

```bash
pnpm add @nexload-sdk/payload-preset @nexload-sdk/logger payload @payloadcms/translations
```

```ts
import { configureLogger } from "@nexload-sdk/logger";
import { nexloadPreset } from "@nexload-sdk/payload-preset";
import { buildConfig } from "payload";

configureLogger({ service: "shop-cms" });
export default buildConfig({
  // Add db, secret, and collections here.
  plugins: [...nexloadPreset()],
});
```

Configure the logger before `buildConfig()`. Define collections explicitly, including the auth collection. See [guides](./guides/) and the [API reference](./api/).
