# Payload Suite Overview

Compose the Payload packages by responsibility.

**Topic:** ecosystem
**Canonical page:** https://gecut.github.io/nexload-sdk/start/payload-packages/
| Package | Responsibility |
| --- | --- |
| [Payload Schema](/nexload-sdk/packages/payload-schema/) | Canonical field definitions and validation projected to Payload and Zod. |
| [Payload Fields](/nexload-sdk/packages/payload-fields/) | Semantic field factories and Admin UI, backed by [Persian utilities](/nexload-sdk/packages/persian/). |
| [Payload Editor](/nexload-sdk/packages/payload-editor/) | Lexical features and editor presets. |
| [Payload Operations](/nexload-sdk/packages/payload-operations/) | Typed custom operation contracts, endpoints, and clients. |
| [Payload Hooks](/nexload-sdk/packages/payload-hooks/) | Collection audit hooks and structured events. |
| [Payload Preset](/nexload-sdk/packages/payload-preset/) | Top-level configuration composition for Persian defaults, logging, field hooks, and audit hooks. |

The preset does not define or change collection fields. Use Payload Schema and Payload Fields for fields, and keep collection definitions, access control, and business rules in the application.

## Recommended configuration

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

Call `configureLogger()` before `buildConfig()`. Declare collections explicitly, including the auth collection, to audit them. The preset includes `payloadFieldsPlugin` and `auditPlugin`; avoid registering them twice. Enable read auditing only when needed. See the [preset guide](/nexload-sdk/packages/payload-preset/guides/) and [audit guide](/nexload-sdk/packages/payload-hooks/guides/).
