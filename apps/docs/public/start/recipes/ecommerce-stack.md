# E-commerce stack

Compose Payload, health checks, logging, and Persian utilities.

**Topic:** documentation
**Canonical page:** https://gecut.github.io/nexload-sdk/start/recipes/ecommerce-stack/
This example connects one Payload CMS project to SDK logging, field factories, a readiness check, and Persian money formatting. Configure a Payload database adapter, secret, and auth collection for your deployment.

```bash
pnpm add @nexload-sdk/logger @nexload-sdk/healthcheck @nexload-sdk/healthcheck-payload @nexload-sdk/payload-preset @nexload-sdk/payload-fields @nexload-sdk/persian payload @payloadcms/translations react react-dom
```

Configure the logger before building Payload configuration. The preset registers the fields plugin and audit hooks.

```ts
// payload.config.ts
import { configureLogger } from "@nexload-sdk/logger";
import { moneyField, slugField } from "@nexload-sdk/payload-fields";
import { nexloadPreset } from "@nexload-sdk/payload-preset";
import { buildConfig } from "payload";

configureLogger({ service: "shop-cms" });

export default buildConfig({
  // Supply db, secret, and an auth collection for your project.
  collections: [{
    slug: "products",
    fields: [
      { name: "title", type: "text", required: true },
      ...slugField({ source: "title" }),
      moneyField({ name: "price", currency: "IRT" }),
    ],
  }],
  plugins: nexloadPreset(),
});
```

After Payload initializes, attach its collection check to a health manager. Expose the resulting readiness report through your infrastructure's preferred endpoint.

```ts
import { createHealthManager } from "@nexload-sdk/healthcheck";
import { payloadHealthCheck } from "@nexload-sdk/healthcheck-payload";
import config from "@payload-config";
import { getPayload } from "payload";

const payload = await getPayload({ config });
const health = createHealthManager({
  service: { name: "shop-cms" },
  checks: [payloadHealthCheck(payload, { collection: "products", scopes: ["readiness"] })],
});
const readiness = await health.run("readiness");
```

Format the stored integer using its explicit unit:

```ts
import { formatMoney, money } from "@nexload-sdk/persian/money";

const label = formatMoney(money(12500, "IRT"));
```

See [Payload preset](/nexload-sdk/packages/payload-preset/), [field rules](/nexload-sdk/packages/payload-fields/), and [healthcheck Payload](/nexload-sdk/packages/healthcheck/payload/) for deployment details.
