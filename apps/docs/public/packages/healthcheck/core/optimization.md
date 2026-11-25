# healthcheck — Optimization

Production choices for @nexload-sdk/healthcheck.

**Topic:** optimization
**Package:** `@nexload-sdk/healthcheck` v4.1.0
**Canonical page:** https://gecut.github.io/nexload-sdk/packages/healthcheck/core/optimization/
## Reserve liveness for the process

Keep database, cache and remote HTTP checks in readiness when dependency outages should stop traffic without restarting the process.

## Protect diagnostics

Expose a minimal public probe. Restrict detailed reports and metrics to authorized callers.

## Bound probe execution

The manager defaults to a 1,000 ms timeout per check and eight concurrent checks. Tune these limits for the dependencies being probed.

## Profiles do not filter output

Profiles are hints for checks and collectors, not report filters. Use `toHealthJson()` or `stringifyHealthJson()` to control response details.

## Sources

[Package guidance](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/README.md) · [Implementation](https://github.com/gecut/nexload-sdk/blob/main/packages/healthcheck/core/src/index.ts). · [Matching skill](https://github.com/gecut/nexload-sdk/blob/main/skills/healthcheck/core/SKILL.md).
