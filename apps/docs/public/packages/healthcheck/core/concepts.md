# Healthcheck Core concepts

Understand scopes, checks, collectors, status, and report profiles.

**Topic:** concepts
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/concepts/
## Scopes

| Scope | Question |
| --- | --- |
| `liveness` | Should the process keep running? |
| `readiness` | Can this instance accept traffic? |
| `startup` | Has initialization completed? |
| `diagnostics` | What protected operational detail is available? |

`all` is a run scope for monitoring, not a check registration scope.

## Checks and collectors

Checks return a status and can affect aggregate health when critical for the selected scope. Collectors add report-level metrics and resources; collector failure does not become a check result.

## Status

Statuses are `ok`, `degraded`, and `unhealthy`. Critical results determine aggregate status. The default HTTP policy maps degraded to 200 and unhealthy to 503; strict readiness can map degraded to 503.

## Data profiles

Use `minimal`, `standard`, or `diagnostic` profiles. Details can contain sensitive operational data, so expose diagnostic output only behind access control.
