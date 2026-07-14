# @nexload-sdk/healthcheck-next

Next.js App Router route factories for `@nexload-sdk/healthcheck`.

```ts
import { createNextHealthRoute } from "@nexload-sdk/healthcheck-next";
import { health } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "readiness",
  format: "json"
});
```

Protection is fail-closed. A supplied `protect` object must configure a non-empty bearer token, valid Basic credentials, or an IPv4 allowlist. IP and CIDR rules require `trustProxy: true`; only enable it when the configured proxy header is controlled by your deployment.
