# Healthcheck Next.js guides

Design public probes and protected operational routes.

**Topic:** guides
**Package:** `@nexload-sdk/healthcheck-next` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/guides/
Expose simple unauthenticated `/livez` and `/readyz` routes for your orchestrator. Keep `includeDetails` false. Create a separate protected diagnostics route:

```ts
export const { GET, HEAD } = createNextHealthRoute(health, {
  scope: "diagnostics",
  includeDetails: true,
  protect: { bearerToken: process.env.HEALTH_TOKEN! },
});
```

Do not combine bearer and Basic authentication. Only trust forwarded IP headers when a known reverse proxy overwrites them. Use secret comparison supplied by the factory, not query-string tokens.
