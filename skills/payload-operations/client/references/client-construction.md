# Client construction

## Two client options

### Option A: Pure operations client (`@nexload-sdk/payload-operations/client`)

Zero dependency on `@payloadcms/sdk`. Ideal for frontends, microservices, and client bundles that only call custom operations:

```ts
import { createOperationsClient } from "@nexload-sdk/payload-operations/client";

const client = createOperationsClient({
  baseURL: "https://cms.example.com",
  basePath: "/api/operations",
  operations,
});

const result = await client.inventory.checkStock({ sku: "ITEM-1" });
```

### Option B: Integrated CMS client (`@nexload-sdk/payload-operations/cms`)

Shares transport and credentials between custom operations and the native `PayloadSDK`. Requires optional peer `@payloadcms/sdk`:

```ts
import { createCMSClient } from "@nexload-sdk/payload-operations/cms";

const cms = createCMSClient<Config, typeof operations>({
  operations,
  basePath: "/api/operations",
  payload: {
    baseURL: "https://cms.example.com",
    baseInit: { credentials: "include" },
  },
});

// Native Payload SDK
const posts = await cms.payload.find({ collection: "posts" });

// Typed Custom Operations
const stock = await cms.operations.inventory.checkStock({ sku: "ITEM-1" });
```

## Base paths and URLs

Set `basePath` to the same normalized value used by `createPayloadEndpoints` (defaults to `"/operations"`). Do not append a query or hash to `baseURL`.

In `createCMSClient`, `cms.payload` remains the exact public `PayloadSDK<Config>` instance. `cms.operations` and `client` are real immutable trees mirroring the contract, not dynamic proxies. Supplying `Config` requires the operation type argument as well.

Operation call options omit `method` and `body`; the package owns both.
