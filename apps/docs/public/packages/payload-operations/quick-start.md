# Quick start

Define one operation contract, expose Payload endpoints, and call it from the client.

**Topic:** quick-start
**Package:** `@nexload-sdk/payload-operations` v1.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/payload-operations/quick-start/
Define the shared contract in a module that is safe for server and client imports:

```ts
import {
  defineCMSOperations,
  operation,
} from "@nexload-sdk/payload-operations/contract";
import { z } from "zod";

export const cmsOperations = defineCMSOperations({
  account: {
    rename: operation({
      input: z.object({ name: z.string().trim().min(1) }),
      output: z.object({ name: z.string() }),
      errors: {
        NAME_TAKEN: {
          status: 409,
          message: "Account name is already in use.",
        },
      },
    }),
  },
});
```

Create Payload endpoints:

```ts
import { createPayloadEndpoints } from "@nexload-sdk/payload-operations/server";

export const operationEndpoints = createPayloadEndpoints({
  operations: cmsOperations,
  handlers: {
    account: {
      rename: async ({ errors, input, req }) => {
        const existing = await req.payload.find({
          collection: "users",
          limit: 1,
          overrideAccess: false,
          req,
          where: { name: { equals: input.name } },
        });

        if (existing.totalDocs > 0) {
          throw errors.NAME_TAKEN();
        }

        return { name: input.name };
      },
    },
  },
});
```

Add the returned endpoints to Payload's root `endpoints` array. The default access policy requires `req.user`; override an operation explicitly when it must be public.

Create a client using the same contract:

```ts
import { createCMSClient } from "@nexload-sdk/payload-operations/client";

const cms = createCMSClient({
  operations: cmsOperations,
  payload: { baseURL: "https://cms.example.com/api" },
});

const result = await cms.operations.account.rename({ name: "Nexload" });
```

`cms.payload` is the native `PayloadSDK` instance. `cms.operations` mirrors the contract tree without an extra namespace.
