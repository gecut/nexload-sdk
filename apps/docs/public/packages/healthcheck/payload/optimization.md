# healthcheck-payload — Optimization

Production choices for @nexload-sdk/healthcheck-payload.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck-payload` v2.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/payload/optimization/
## Bound readiness query cost

Choose a small collection, use depth zero and supply a narrow where clause for frequent polls.

## Interpret probe failures

The Payload query check is critical for readiness and noncritical for diagnostics. A failed query reports PAYLOAD\_QUERY\_FAILED.

## Keep the default query small

The check defaults to `limit: 1`, `depth: 0`, and readiness. Frequent heavy queries can overload the database.

## Decide whether an empty collection is unhealthy

Set `expectedMinDocuments` only when an empty collection represents an operational failure, such as missing required seed configuration.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/payload/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/payload/SKILL.md).
