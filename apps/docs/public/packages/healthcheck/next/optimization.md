# healthcheck-next — Optimization

Production choices for @nexload-sdk/healthcheck-next.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck-next` v3.0.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/next/optimization/
## Trust a controlled proxy

IP and CIDR filtering support IPv4 and require trustProxy. Enable it only when the reverse proxy strips and sets the configured header.

## Choose one authorization scheme

Select bearer token or basic authentication per route. Both use the Authorization header.

## Keep responses uncached

Responses use `cache-control: no-store, max-age=0`. Health route `includeDetails` defaults to `false`; enable details only for protected routes.

## Match the runtime to the manager

The route adapter supports Next.js Node.js and Edge runtimes. Use `runtime = "nodejs"` when the manager uses the Node adapter.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/next/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/nextjs-routes/SKILL.md).
